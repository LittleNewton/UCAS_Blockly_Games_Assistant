/*
 * 文件名：popup.js
 * 创建时间：2021 Sept. 23
 * 修改时间：2021 Dec.  15
 * 作者：刘鹏
 * 文件描述：popup menu 的 JS 函数，用以实现通信
 */



/*
 * popup 虽然可以直接调用 background 里面的函数，但是这样仍算是在 popup 里执行，并非让 background 自己执行
 * 因此要通过消息队列 inform 后台界面
 */
let bg = chrome.extension.getBackgroundPage();



/*
 * 处理 cookie 和刚 popup 时的颜色北境
 */
if (document.cookie != '') {
    document.getElementById('status').value = document.cookie
    set_status_color(document.cookie)
} else {
    document.cookie = 'OFFLINE'
    document.getElementById('status').className = 'button status_offline'
}



/*
 * 处理 STATUS 框的背景色
 */
function set_status_color (status) {
    switch (status) {
        case ('ONLINE') : {
            document.getElementById('status').className = 'button status_online'
            break
        }

        case ('OFFLINE') : {
            document.getElementById('status').className = 'button status_offline'
            break
        }

        case ('ERROR') : {
            document.getElementById('status').className = 'button status_error'
            break
        }

        default: {
            document.getElementById('status').className = 'button status_error'
        }
    }
}



// click: 打开后台页 (open_background)
$('#open_background').click(e => {
    window.open(chrome.extension.getURL('background.html'))
});



/*
 * click: 注册 (register)
 */
$('#Register').click(function () {
    let username = document.getElementById('username').value
    let password = document.getElementById('passwd').value
    bg.register(username, password, function(status) {
        document.getElementById('status').value = status
        set_status_color(status)
        document.cookie = status
    })
})



/*
 * click: 登录 (login)
 */
$('#Sign_in').click(function () {
    let username = document.getElementById('username').value
    let password = document.getElementById('passwd').value
    bg.login(username, password, function(status) {
        document.getElementById('status').value = status
        set_status_color(status)
        document.cookie = status
    });
})



/* 
 * 注销
 */
$('#btn_logout').click (function () {
    bg.logout(function(status) {
        document.getElementById('status').value = status
        set_status_color(status)
        document.cookie = status
    })
})



/*
 * popup ==> content-script
 * 请求 Content Script 把 localStorage 拿出来传给 background
 */
$('#btn_upload_data').click(function () {
    bg.resolve_game_data('read')
})



// 下载数据
$('#btn_download_data').click(e => {
    bg.resolve_game_data('write')
});
