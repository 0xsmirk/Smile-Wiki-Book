---
title: AFLplusplus模糊测试IOT二进制应用
---
## 0x00.前言

> **PS:并非所有的crash都可以构造成POC/EXP**
> - 参考链接:https://blog.attify.com/fuzzing-iot-devices-part-1/
> - 参考链接:https://blog.attify.com/fuzzing-iot-binaries-with-afl-part-ii/

Fuzzing是目前漏洞挖掘比较热门和常用的漏洞挖掘技巧，之前的一篇文章已经给大家介绍了几个IOT Fuzzing常用的框架，这里主要针对前面提到的框架进行详细的阐述。

## 0x01.AFL++

> AFL++ 是 Google 的 AFL 的一个分支，具有更快的速度，更多的突变，更多的自定义模块等
>
> AFL++的github地址：https://github.com/AFLplusplus/AFLplusplus，在这里看到更完整的教程和测试用例等内容

这里我们主要使用AFL++ Fuzzing 测试IOT的二进制文件，当我们解压提取一个固件时，能够获得大量的IOT二进制应用，如果要进行漏洞挖掘则需要将二进制文件进行逆向分析，然后查找危险函数以及输入接口，对于一个大型的应用，直接进行二进制分析会大大降低我们的效率，所以可以使用Fuzzing技术对IOT的二进制文件进行模糊测试，提高漏洞挖掘效率。

对于IOT的二进制文件通常由于架构的不同，不能直接进行Fuzzing，AFL++可以使用Qemu、Unicorn或Frida 三种模式进行Fuzzing，虽然不如有源码进行Fuzzing高效，但是其适用面广，并且同样能提高漏洞挖掘效率。

AFL++使用qemu用户模式模拟仿真来运行二进制文件，其使用的qemu是进行修改的版本，在程序执行时检测基本块，根据收集的信息生成测试用例，通过生成的大量测试用例触发不同的代码路径，从而提高代码的覆盖率，提高触发Crash的概率。

AFL++和其他的类似的Fuzzing工具（AFL，hongfuzz等）一样，仅适用于文件输入的Fuzzing，不支持从套接字输入的程序，对于套接字的Fuzzing测试在下篇进行讲解，本篇文件将重点落在环境的搭建及文件输入相关的二进制应用的Fuzzing。

## 0x02.AFL++环境搭建

> 系统环境：Ubuntu 18.04
>
> 测试固件：TP-Link SR20、Cisco RV130X

AFL++的安装也比较简单，执行步骤如下：

```shell
$ sudo apt update
$ sudo apt install git make build-essential clang ninja-build pkg-config libglib2.0-dev libpixman-1-dev
$ git clone https://github.91chi.fun/https://github.com/AFLplusplus/AFLplusplus.git
$ cd AFLplusplus
$ make all
$ cd qemu_mode
$ CPU_TARGET=arm ./build_qemu_support.sh # 这里编译ARM架构的
```

## 0x03.AFL++案例一

> Fuzzing测试基于文件输入的IOT二进制应用

这里进行测试TP-Link SR20路由器的固件，固件的下载地址如下：https://static.tp-link.com/2018/201806/20180611/SR20(US)_V1_180518.zip

使用Binwalk提取固件

```shell
$ binwalk -Me tpra_sr20v1_us-up-ver1-2-1-P522_20180518-rel77140_2018-05-21_08.42.04.bin
```

![image-20220302213305677.png](http://img.smile-space.com/image-20220302213305677.png)

接下来我们查找来自文件输入的程序进行Fuzzing测试

![image-20220302213428327.png](http://img.smile-space.com/image-20220302213428327.png)

这里可以看到大家耳熟能详的bmp2tiff应用，那么我们就拿bmp2tiff进行Fuzzing测试，生成一个bmp的测试用例，将测试用例放到创建的bmp-input文件夹中，同时创建bmp-output Fuzzing输出文件夹

![image-20220302221120120.png](http://img.smile-space.com/image-20220302221120120.png)

接下来，执行以下命令进行Fuzzing测试

```shell
$ QEMU_LD_PREFIX=./squashfs-root/ /home/iot/tools/AFLplusplus/afl-fuzz -Q -i squashfs-root/bmp-input/ -o squashfs-root/bmp-output/ -- ./squashfs-root/usr/bin/bmp2tiff @@ /dev/null # root权限下
# -Q：适用qemu模式
# -i：输入文件夹
# -o：输出文件夹
# @@：表示将用来替换的样本
# /dev/null：忽略错误信息
```

![image-20220302221919142.png](http://img.smile-space.com/image-20220302221919142.png)

可以看到在Fuzzing期间触发了8个crash

## 0x04.AFL++案例二

这里进行测试的是Cisco RV130X路由器的固件，固件下载地址如下：`https://software.cisco.com/download/home/285026141/type/282465789/release/1.0.3.55?i=!pp`

同样提取固件，这里要分析的是负责处理json的程序，jsonparse

![image-20220302224350323.png](http://img.smile-space.com/image-20220302224350323.png)

同样生成测试的json文件，输入文件夹和输出文件

![image-20220302224534497.png](http://img.smile-space.com/image-20220302224534497.png)

json文件的内容如下：

```json
{"name":"smile","profession":"iot researcher","age":25,"address":{"city":"Yan Bian","postalCode":0000,"Country":"CN"},"socialProfiles":[{"name":"Twitter","link":"https://twitter.com"},{"name":"Facebook","link":"https://www.facebook.com"}]}
```

执行如下命令进行Fuzzing测试

```shell
flaw@smile:~/Desktop$ QEMU_LD_PREFIX=./squashfs-root/ /home/flaw/tools/AFLplusplus/afl-fuzz -Q -i ./squashfs-root/input-json/ -o ./squashfs-root/output-json/ -- ./squashfs-root/usr/sbin/jsonparse @@ # 有时候需要在root权限下执行echo core >/proc/sys/kernel/core_pattern
```

![image-20220302224720010.png](http://img.smile-space.com/image-20220302224720010.png)

可以看到也出现了crash，这里使用程序直接解析生成的crash文件

![](https://img.smile-space.com/20220504151850.png)

这里可以看到触发段错误。

使用`qemu`挂载要调试的目标应用

```shell
flaw@smile:~/Desktop/squashfs-root$ sudo chroot . ./qemu-arm-static -g 9999 ./usr/sbin/jsonparse ./output-json/default/crashes/id:000000,sig:11,src:000000,time:187,execs:101,op:havoc,rep:16
```

使用`gdb-multiarch`调试目标应用

```shell
flaw@smile:~/Desktop/squashfs-root$ gdb-multiarch -q ./usr/sbin/jsonparse
pwndbg: loaded 191 commands. Type pwndbg [filter] for a list.
pwndbg: created $rebase, $ida gdb functions (can be used with print/break)
Reading symbols from ./usr/sbin/jsonparse...(no debugging symbols found)...done.
pwndbg> set architecture arm
The target architecture is assumed to be arm
pwndbg> set sysroot lib/
pwndbg> target remote :9999
```

先直接使用`c`直接运行程序，可以得到如下图情况：

![](https://img.smile-space.com/20220504163023.png)

这里可以看到崩溃的位置为`0x00008848`，接下来使用`IDA`逆向分析`jsonparse`

![](https://img.smile-space.com/20220504163145.png)

可以看到调用`LDR`加载地址造成的段错误，接下来`grep`查看一下`json_object_get_object`导出函数所在的动态链接库

![](https://img.smile-space.com/20220504163304.png)

接下来，逆向分析`./usr/lib/libjson.so.0`即可

![](https://img.smile-space.com/20220504163346.png)

这里可以看到判断`json`对象的情况，从而是返回0还是具体的地址，这里由于`*a1`解引用的值不为4，所以返回值为0。

![](https://img.smile-space.com/20220504163526.png)

这是`R0`寄存器的值加上`#20`地址无法访问，造成了段错误，因此这个是一个不可以被利用的`crash`。

