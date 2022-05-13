---
title: cwe_check
---
# cwe_check
---

<br>
<a-alert type="success" message="cwe_checker 是一套用于检测常见错误类的检查，例如使用危险函数和简单的整数溢出。这些错误类正式称为通用弱点枚举(CWE)。它的主要目标是帮助分析师快速找到易受攻击的代码路径。" description="" showIcon>
</a-alert>
<br/>

## 0x01.环境搭建

> cwe_check的基础依赖:
> - Rust >= 1.57
> - Ghidra >= 9.2

`ubuntu 18.04`安装`java 11`。

```shell
$ sudo apt install openjdk-11-jdk
```

`ubuntu 18.04`安装`Rust`。PS：建议开代理进行安装。

```shell
$ curl https://sh.rustup.rs -sSf | sh # 使用默认选项就可以
$ source $HOME/.cargo/env
$ sudo apt install build-essential
```

克隆`cwe_check`项目.

```shell
$ git clone https://github.com/fkie-cad/cwe_checker.git
$ cd cwe_checker
$ make all GHIDRA_PATH=/home/flaw/tools/ghidra_10.1.2_PUBLIC
```

## 0x02.案例一

`UAF`的`DEMO`如下：

```c
#include <stdio.h>
#include <unistd.h>
#define BUFSIZER1 512
#define BUFSIZER2 ((BUFSIZER1/2) - 8)
int main(int argc, char **argv) {
	char *buf1R1;
	char *buf2R1;
	char *buf2R2;
	char *buf3R2;
	buf1R1 = (char *) malloc(BUFSIZER1);
	buf2R1 = (char *) malloc(BUFSIZER1);
	free(buf2R1);
	buf2R2 = (char *) malloc(BUFSIZER2);
	buf3R2 = (char *) malloc(BUFSIZER2);
	strncpy(buf2R1, argv[1], BUFSIZER1-1);
	free(buf1R1);
	free(buf2R2);
	free(buf3R2);
}
```

编译环境。

```shell
$ gcc UAF.c -o UAF
```

使用`cwe_check`检测二进制应用。

```shell
flaw@smile:~/Desktop$ cwe_checker ./UAF # 可以检测到产生漏洞的位置
[CWE416] (0.3) (Use After Free) Call to strncpy at 00100747 may access dangling pointers through its parameters
[CWE476] (0.3) (NULL Pointer Dereference) There is no check if the return value is NULL at 001006ee (malloc).
[CWE476] (0.3) (NULL Pointer Dereference) There is no check if the return value is NULL at 001006fc (malloc).
[CWE476] (0.3) (NULL Pointer Dereference) There is no check if the return value is NULL at 00100716 (malloc).
[CWE476] (0.3) (NULL Pointer Dereference) There is no check if the return value is NULL at 00100724 (malloc).
[CWE676] (0.1) (Use of Potentially Dangerous Function) main (00100747) -> strncpy
[CWE416] (0.2) (Use After Free) Call at 00100747 may access freed memory
```

通过内容可以看到对应的漏洞。但是这么查看比较费劲，为了方便，我们可以使用`ghidra`或`ida`的插件，在`ida`和`ghidra`中会有提示标注。

```shell
flaw@smile:~/Desktop$ cwe_checker UAF -j -o uaf.json
flaw@smile:~/Desktop$ cat uaf.json # json文件用于展示
[
  {
    "name": "CWE416",
    "version": "0.3",
    "addresses": [
      "00100747"
    ],
    "tids": [
      "instr_00100747_2"
    ],
    "symbols": [],
    "other": [
      [
        "Accessed ID instr_001006fc_2 @ RAX may have been already freed at instr_0010070c_2"
      ]
    ],
    "description": "(Use After Free) Call to strncpy at 00100747 may access dangling pointers through its parameters"
  },
  {
    "name": "CWE476",
    "version": "0.3",
    "addresses": [
      "001006ee",
      "00100753"
    ],
    "tids": [
      "instr_001006ee_2",
      "instr_00100753_2"
    ],
    "symbols": [
      "malloc"
    ],
    "other": [],
    "description": "(NULL Pointer Dereference) There is no check if the return value is NULL at 001006ee (malloc)."
  },
  {
    "name": "CWE476",
    "version": "0.3",
    "addresses": [
      "001006fc",
      "0010070c"
    ],
    "tids": [
      "instr_001006fc_2",
      "instr_0010070c_2"
    ],
    "symbols": [
      "malloc"
    ],
    "other": [],
    "description": "(NULL Pointer Dereference) There is no check if the return value is NULL at 001006fc (malloc)."
  },
  {
    "name": "CWE476",
    "version": "0.3",
    "addresses": [
      "00100716",
      "0010075f"
    ],
    "tids": [
      "instr_00100716_2",
      "instr_0010075f_2"
    ],
    "symbols": [
      "malloc"
    ],
    "other": [],
    "description": "(NULL Pointer Dereference) There is no check if the return value is NULL at 00100716 (malloc)."
  },
  {
    "name": "CWE476",
    "version": "0.3",
    "addresses": [
      "00100724",
      "0010076b"
    ],
    "tids": [
      "instr_00100724_2",
      "instr_0010076b_2"
    ],
    "symbols": [
      "malloc"
    ],
    "other": [],
    "description": "(NULL Pointer Dereference) There is no check if the return value is NULL at 00100724 (malloc)."
  },
  {
    "name": "CWE676",
    "version": "0.1",
    "addresses": [
      "00100747"
    ],
    "tids": [
      "instr_00100747_2"
    ],
    "symbols": [
      "main"
    ],
    "other": [
      [
        "dangerous_function",
        "strncpy"
      ]
    ],
    "description": "(Use of Potentially Dangerous Function) main (00100747) -> strncpy"
  },
  {
    "name": "CWE416",
    "version": "0.2",
    "addresses": [
      "00100747"
    ],
    "tids": [
      "instr_00100747_2"
    ],
    "symbols": [],
    "other": [],
    "description": "(Use After Free) Call at 00100747 may access freed memory"
  }
]
```

使用`ghidra`加载应用。

![1652424628252.png](http://img.smile-space.com/1652424628252.png)

`ghidra`加载`cwe_checker`脚本路径。

![1652424779591.png](http://img.smile-space.com/1652424779591.png)

这时可以搜索到对应的脚本。

![1652424864057.png](http://img.smile-space.com/1652424864057.png)

运行对应的脚本，导入对应的`json`文件即可，这时对应的描述和颜色标注即可显示。

![1652424951972.png](http://img.smile-space.com/1652424951972.png)

![1652425018642.png](http://img.smile-space.com/1652425018642.png)

**PS:0.5 版包含切换到 Ghidra 作为标准后端并删除旧的 BAP 后端**