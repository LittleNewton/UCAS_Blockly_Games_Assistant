/*
 * 文件名：popup.js
 * 创建时间：2021 Sept. 23
 * 修改时间：2021 Dec.  15
 * 作者：刘鹏
 * 文件描述：popup menu 的 JS 函数，用以实现通信
 */



// click: 打开后台页 (open_background)
$('#open_background').click(e => {
    window.open(chrome.extension.getURL('background.html'))
});



/*
 * click: 注册 (register)
 */
$('#register_js').click(function () {
    let username = prompt('请输入用户名')
    let password = prompt('请输入密码')
    register(username, password)
})



/*
 * click: 登录 (login)
 */
$('#Sign_in').click(function () {
    let username = document.getElementById('username').value
    let password = document.getElementById('passwd').value
    login(username, password);
    document.getElementById('username').innerText = '您已登录'
})



/* 
 * 注销
 */
$('#btn_logout').click (function () {
    logout()
})



/*
 * popup ==> content-script
 * 请求 Content Script 把 localStorage 拿出来传给 background
 */
$('#btn_upload_data').click(function () {
    upload_game_data()
})



// 下载数据
$('#btn_download_data').click(e => {
    download_game_data()
});
