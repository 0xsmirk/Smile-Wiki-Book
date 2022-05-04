---
title: IDA漏洞分析插件
---

# IDA二进制漏洞分析常用插件
---

## 0x00.IDA插件列表

> - firmeye:基于敏感函数参数回溯来辅助漏洞挖掘


## 0x01.firmeye

> firmeye 是一个 IDA 插件，基于敏感函数参数回溯来辅助漏洞挖掘。

- 漏洞类型支持：缓冲区溢出、命令执行、格式化字符串
- 架构支持：ARM

### firmeye安装

> - IDA版本：IDA 7.5 绿化版
> - python版本：python 3.8

1. 下载本项目：`https://github.com/firmianay/firmeye.git`
2. 安装依赖：`.\python38\python.exe -m pip install -r .\plugins\firmeye\requirements.txt`
3. 将 firmeye 和 firmeye.py 复制到 IDA Pro 插件目录下
4. 打开 IDA Pro 并加载待分析固件程序。
    - Ctrl+F1 查看插件使用帮助。热键：
    - Ctrl+Shift+s：主菜单
    - Ctrl+Shift+d：启动/禁用调试钩子
    - Ctrl+Shift+c：扫描代码模式（TODO）
    - Ctrl+Shift+x：逆向辅助工具
    - Ctrl+Shift+q：功能测试

### firmeye使用

> - 测试固件：Tenda AC15

使用`Ctrl+Shift+s`调出子菜单，使用查看危险函数即查看到检测的函数

![1651587433323.png](http://img.smile-space.com/1651587433323.png)

