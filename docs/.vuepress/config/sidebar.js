/*
 * @Description: 导入章节目录
 * @Author: smile
 * @Date: 2022-04-27 22:44:17
 * @LastEditTime: 2022-05-03 17:07:14
 * @LastEditors: smile
 */
module.exports = {
    '/about/': require('../../about/sidebar_contents'), //初始下拉为about文件夹下sidebar_contents中包含的下拉菜单，及具体的内容
    '/reverse/tools': require('../../reverse/tools/sidebar_contents'),
    '/reverse/windows': require('../../reverse/windows/sidebar_contents'),
    '/reverse/linux': require('../../reverse/linux/sidebar_contents'),
    '/reverse/iot': require('../../reverse/iot/sidebar_contents'),
    '/binary/tools': require('../../binary/tools/sidebar_contents'),
    '/binary/windows': require('../../binary/windows/sidebar_contents'),
    '/binary/linux': require('../../binary/linux/sidebar_contents'),
    '/binary/iot': require('../../binary/iot/sidebar_contents'),
    '/modern/fuzzing': require('../../modern/fuzzing/sidebar_contents'),
    '/modern/sym_execution': require('../../modern/sym_execution/sidebar_contents'),
    '/car/firmware':require('../../car/firmware/sidebar_contents.js')
};
