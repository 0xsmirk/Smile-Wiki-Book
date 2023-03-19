/*
 * @Description: 项目的整体目录
 * @Author: smile
 * @Date: 2022-04-27 22:24:18
 * @LastEditTime: 2022-05-03 17:06:51
 * @LastEditors: smile
 */
module.exports = [
    {
        text: '首页',
        link: '/',
    },
    {
        text: '车联网安全',
        items: [
            {
                text: '汽车固件逆向',
                link: '/car/firmware/',
            }
        ]
    },
    {
        text: '逆向分析',
        items: [
            {
                text: '逆向分析工具',
                link: '/reverse/tools/',
            },
            {
                text: "Windows逆向",
                link: "/reverse/windows/",
            },
            {
                text: "Linux逆向",
                link: "/reverse/linux/",
            },
            {
                text: "IOT逆向",
                link: "/reverse/iot/",
            }
        ]
    },
    {
        text: '二进制漏洞',
        items: [
            {
                text: '二进制工具',
                link: '/binary/tools/',
            },
            {
                text: "Windows二进制漏洞",
                link: "/binary/windows/",
            },
            {
                text: "Linux二进制漏洞",
                link: "/binary/linux/",
            },
            {
                text: "IOT二进制漏洞",
                link: "/binary/iot/",
            }
        ]
    },
    {
        text: '现代技巧',
        items: [
            {
                text: "模糊测试",
                link: "/modern/fuzzing/",
            },
            {
                text: "符号执行",
                link: "/modern/sym_execution/",
            }
        ]
    },
    {
        text: '关于文库',
        items: [
            {
                text: "文库介绍",
                link: "/about/",
            },
            {
                text: "支持项目",
                link: "/about/support",
              },
        ]
    },
];
