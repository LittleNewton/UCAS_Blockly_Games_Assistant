/*
 * 文件名：popup.js
 * 创建时间：2021 Sept. 23
 * 修改时间：2021 Dec.  14
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
$('#upload_js').click(function () {
    let msg = {cmd: 'test'}
    chrome.tabs.query ({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response) {
        console.log('来自content的回复：' + response)
        })
    })
})



// 下载数据
$('#download_js').click(e => {
    download_game_data();
});
