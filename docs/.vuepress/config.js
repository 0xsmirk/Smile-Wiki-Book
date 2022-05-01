module.exports = {
    title: 'Smile文库', //首页左上角的名称
    theme: 'antdocs', //使用的主题
    description: '主要关于逆向分析和二进制漏洞相关的内容', //描述信息
    head: [
        ['link', { rel: 'icon', href: '/img/smile_icon.png' }], // 增加一个自定义的 favicon(网页标签的图标)
    ],
    markdown: {
        lineNumbers: true // 代码块显示行号
    },
    themeConfig: {
        sidebarDepth: 2,
        backToTop: true,
        smoothScroll: true,
        nav: require('./config/nav'),
        sidebar: require('./config/sidebar'),
        sidebarDepth: 0,
        lastUpdated: '上次更新',
        logo: '/img/smile_icon.png',
        repo: 'https://github.com/smile-e3/Smile-Wiki-Book',
        editLinks: true,
    }
}