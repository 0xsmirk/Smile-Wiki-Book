---
home: true
heroImage: /img/smile_icon.png
actionBtn:
  text: 关于文库
  link: /about/
  type: primary
  ghost: true
  size: large
preactionBtn:
  text: 支持项目
  link: /about/support
  type: primary
  ghost: true
  size: large
features:
- title: 实用
  details: 真实实战
- title: 详细
  details: 一条龙服务
- title: 开源
  details: 自由搭建

head: [
    ['link', { rel: 'icon', href: '/img/smile_icon.png' }],
    ['meta', { name: 'referrer', content: 'never' }],
    ['meta', { name: 'keywords', content: 'Smile文库,二进制,逆向分析,漏洞研究,符号执行,模糊测试' }],
    ['meta', { name: 'description', content: 'Smile文库是一个面向二进制安全研究和逆向分析的知识库，涉及逆向分析，IOT/Linux/Windows等漏洞挖掘，Fuzzing，符号执行等方面的内容，主要用于整理逆向分析技巧及二进制漏洞挖掘技巧，帮助大家更好的入门二进制安全。目前主要用于个人技能和知识库的储备。' }],
  ]
footer: Powered by Smile文库 | Copyright © 2020-2022 Smile文库
---

</br>
</br>
<a-alert type="info" message="提示" description="由于传播、利用此文所提供的信息而造成的任何直接或者间接的后果及损失，均由使用者本人负责，文章作者不为此承担任何责任。Smile文库拥有对此文章的修改和解释权如欲转载或传播此文章，必须保证此文章的完整性，包括版权声明等全部内容。未经作者允许，不得任意修改或者增减此文章内容，不得以任何方式将其用于商业目的。" showIcon>
</a-alert>

</br>
</br>

<template>
  <a-steps>
    <a-step status="finish" title="Login Github">
      <a-icon slot="icon" type="github" />
    </a-step>
    <a-step status="finish" title="Star">
      <a-icon slot="icon" type="star" />
    </a-step>
    <a-step status="process" title="Reading">
      <a-icon slot="icon" type="loading" />
    </a-step>
    <a-step status="wait" title="Thank">
      <a-icon slot="icon" type="smile-o" />
    </a-step>
  </a-steps>
</template>