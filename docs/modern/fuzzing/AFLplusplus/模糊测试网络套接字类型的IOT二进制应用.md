---
title: 模糊测试网络套接字类型的IOT二进制应用
---

## 0x00.前言

> - **AFLplusplus基于网络套接字类型的IOT二进制应用**
> - **PS:并非所有的crash都可以构造成POC/EXP**
> - 参考链接:https://blog.attify.com/fuzzing-iot-binaries-with-afl-part-ii/

使用`AFL`对文件输入类型的`IOT`二进制应用测试还是蛮容易的。使用套接字通过网络进行通信的模糊二进制文件与使用基于文件的 I/O 的模糊二进制文件不同。Vanilla AFL 和 AFL++ 不支持模糊测试网络套接字的二进制应用。这里我们使用将文本转换为`socket`通信来进行模糊测试

同时这里也推荐两个`socket`层的魔改`AFL`模糊测试工具：

- AFLNet:https://github.com/aflnet/aflnet
- AFLNW:https://github.com/LyleMi/aflnw

## 0x01.模拟运行

先使用`qemu-arm-static`模拟运行`http`二进制应用，执行的命令如下：

```shell
flaw@smile:~/Desktop/squashfs-root/www$ sudo qemu-arm-static -L .. ../usr/sbin/httpd  -p 8080 # -p:指定运行端口
===> HTTPD: scheduler set RR with proirity = 99
Unknown host QEMU_IFLA type: 50
*******************************
Unknown host QEMU_IFLA type: 43
bind: Address already in use
```

查看进程是否成功启动

![](https://img.smile-space.com/20220504234837.png)

使用浏览器进行访问查看

![](https://img.smile-space.com/20220504235016.png)

这里可以登录页面是有了，但是其实有些接口服务还是没有启动成功，但是对于帮助大家学些还是可以的

## 0x02.Radamsa

> 使用`Radamsa`进行简单的模糊测试，但是效果不好，容易出错。

使用`conda`创建虚拟环境

```shell
flaw@smile:~/tools$ conda create -n pyradamsa python=3.8
flaw@smile:~/tools$ conda activate pyradamsa
(pyradamsa)flaw@smile:~/tools$ pip install pyradamsa
```

通过`burpsuite`将请求保存为`txt`文本，根据`pyradamsa`编写测试用例

```python
# fuzz-radamsa.py
import socket
import pyradamsa

base_login_request = open("base-login-request.txt", "rb").read() # 读取的请求文件

rad = pyradamsa.Radamsa()
i = j = 0

while True:
    # Create a modified request based on the base request
    fuzzed_request = rad.fuzz(base_login_request)

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # 1 second timeout
    sock.settimeout(1)

    sock.connect(("127.0.0.1", 8080))

    j += 1
    print(f"[+] Request {j} - ", end="")

    sock.sendall(fuzzed_request)
    try:
        sock.recv(50000)
        print("OK")
    except Exception as ex:
            i += 1
            open(f"interesting/{i}.txt", "wb").write(fuzzed_request)
            print(f" {ex} -> saved to {i}.txt")
            sock.close()
```

使用`Radamsa`使用基本登录请求生成修改后的请求数据，然后，这些数据通过套接字发送到在端口8080上运行的网络服务器。如果服务器在 1 秒内没有响应，则输入将保存到感兴趣目录中的文件中。测试结果如下：

```shell
(pyradamsa) flaw@smile:~/Desktop$ python3 rv130.py
[+] Request 1 - OK
[+] Request 2 - OK
[+] Request 3 - OK
[+] Request 4 - OK
[+] Request 5 - OK
[+] Request 6 -  timed out -> saved to 1.txt # 产生超时时感兴趣的请求
[+] Request 7 - OK
[+] Request 8 - OK
[+] Request 9 - OK
[+] Request 10 - OK
[+] Request 11 - OK
[+] Request 12 - OK
[+] Request 13 - OK
[+] Request 14 - OK
[+] Request 15 - OK
[+] Request 16 - OK
[+] Request 17 - OK
[+] Request 18 - OK
[+] Request 19 - OK
[+] Request 20 - OK
[+] Request 21 -  timed out -> saved to 2.txt
```

请求`3`在响应时超时，相应的输入被保存到`1.txt`。请注意，超时与崩溃不同。如果服务器在请求`3`上崩溃，进一步的请求将不会成功。以这种方式进行模糊测试非常低效、缓慢且容易出错，并且通常会导致误报

## 0x03.patch二进制应用

要使用`AFL`进行模糊测试，程序必须接受来自文件的输入。通过修补汇编指令和`LD_PRELOAD`，修改网络函数的`libc`，使得套接字可以接受来自文件的输入

这里我们主要`patch`终止进程相关的函数，例如`close()`,`daemon()`等函数

修正`close()`函数为`exit(0)`函数，防止应用关闭，这里我们主要`patch`了三个位置

![](https://img.smile-space.com/20220505000715.png)

这时再`patch`一个`daemon`函数，将`bl daemon`修改为`eor r0,r0,r0`

![](https://img.smile-space.com/20220505001012.png)

最后保存文件即可。

## 0x04.编译desockmulti

> - `bootlin`已经编译好的交叉编译器:https://toolchains.bootlin.com/

编译`desockmulti`，用来将`socket`通信转换为基于文件输入的函数，使用 ARM 交叉编译器来编译desockmulti

```shell
flaw@smile: file usr/sbin/httpd # 查看文件类型
usr/sbin/httpd: ELF 32-bit LSB executable, ARM, EABI4 version 1 (SYSV), dynamically linked, interpreter /lib/ld-uClibc.so.0, stripped
```

在编译`desockmulti`之前，对其源代码进行微小的更改

```shell
flaw@smile:~$ git diff
diff --git a/desockmulti.c b/desockmulti.c
index 719e6ac..6bcc223 100644
--- a/desockmulti.c
+++ b/desockmulti.c
@@ -450,7 +450,7 @@ int socket(int domain, int type, int protocol)
                pthread_mutex_unlock(&mutex);
        }

-       setup_timer();
+       //setup_timer();

        if ((fd = original_socket(AF_UNIX, SOCK_STREAM, 0)) < 0) {
                perror("socket error");
```

运行`make`指定CC环境变量中的`arm-linux-gcc`编译器

```shell
flaw@smile:~$ make CC=~/armv7-eabihf--uclibc--stable-2020.08-1/bin/arm-linux-gcc
```

生成的文件`desockmulti.so`可以复制到`squashfs-root`目录下，将之前保存的`http`请求作为输入导入

```shell
flaw@smile:~/Desktop/squashfs-root/www$ sudo qemu-arm-static -L .. -E USE_RAW_FORMAT=1 -E LD_PRELOAD=../desockmulti.so ../usr/sbin/httpd_patched -p 8080 < ~/Desktop/base-login-request.txt # -E USE_RAW_FORMAT和-E LD_PRELOAD指定使用`desockmulti.so`将socker通信通过文件输入
===> HTTPD: scheduler set RR with proirity = 99
Unknown host QEMU_IFLA type: 50
*******************************
Unknown host QEMU_IFLA type: 43
--- [1651681072:148607] accept_num=1, connect_num=0
--- [1651681072:149400] Get pkt, sockindex=0, length=940, pkt[0]=80
+++ [1651681072:149789] Intercepted socket()! original type=AF_INET6 fd=4
--- [1651681072:150286] preeny socket bound, Emulating bind on port 8080
--- [1651681072:150470] preeny listen called, accepting connections ...
--- [1651681072:150643] preeny connect_write for serverfd=4 started
--- [1651681072:150907] preeny connect succeeds, write for serverfd=4, client sock index=0
--- [1651681072:151190] preeny write a 940 bytes packet, client socket index = 0, client sockfd=5
--- [1651681072:151440] preeny connection for serverfd=4 client sockfd=5 shutdown
--- [1651681072:151589] pthread_created or directly called for preeny_connect_write, accept_done_num 1, selected_fd_index 0
+++ [1651681072:151724] Intercepted socket()! original type=AF_INET6 fd=6
--- [1651681072:151825] preeny socket bound, Emulating bind on port 8080
--- [1651681072:151872] preeny listen called, accepting connections ...
+++ [1651681072:151959] Intercepted socket()! original type=AF_INET fd=7
--- [1651681072:152016] preeny socket bound, Emulating bind on port 8080
--- [1651681072:152064] preeny listen called, accepting connections ...
+++ [1651681072:152140] Intercepted socket()! original type=AF_INET fd=8
--- [1651681072:152199] preeny socket bound, Emulating bind on port 81
--- [1651681072:152244] preeny listen called, accepting connections ...
+++ [1651681072:152320] Intercepted socket()! original type=AF_INET6 fd=9
--- [1651681072:152404] preeny socket bound, Emulating bind on port 81
--- [1651681072:152446] preeny listen called, accepting connections ...
--- [1651681072:154582] Accept socket at serverfd=4, got fd=10, accept_sock_num=1.
+++ [1651681072:345440] shutting down desockmulti...
+++ [1651681072:345693] ... shutdown complete!
# 程序没有报错，因为没什么问题
```

## 0x05.patchelf添加依赖

使用`patchelf`将`libpthread.so.0`链接添加到`http_patched`中

```shell
flaw@smile:~/Desktop/squashfs-root/$ patchelf --add-needed ./lib/libpthread.so.0 ./usr/sbin/httpd_patched
```

## 0x06.开始模糊测试

创建输入和输出文件夹，输入文件夹中存放刚才的登录请求，执行如下命令进行模糊测试

```shell
flaw@smile:~/Desktop/squashfs-root/www$ QEMU_LD_PREFIX=.. QEMU_SET_ENV=USE_RAW_FORMAT=1,LD_PRELOAD=../desockmulti.so ~/tools/AFLplusplus/afl-fuzz -Q -i ../input-http/ -o ../output-http/ ../usr/sbin/httpd_patched -p 8080
```

![](https://img.smile-space.com/20220505003039.png)