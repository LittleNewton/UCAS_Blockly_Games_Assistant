/*
 * 文件名：inject.js
 * 创建时间：2021 Sept. 23
 * 修改时间：2021 Dec.  07
 * 作者：刘鹏
 * 文件描述：类 Chrome 浏览器的前端代码
 */



/*
 * Let's get started
 */

console.log("让我们开始！ from inject.js")



/*
 * 与服务器建立 webSocket 连接
 */
let socket = new WebSocket('ws://localhost:9999')



// 请求注册账户，funcCode = 4
function register (username, password) {
    let data = {
        'funcCode': '4',
        'username': username,
        'password': password,
        'data_pack': ""
    }
    socket.send(JSON.stringify(data))

    // TO BE DELETED check 输出
    console.log(JSON.stringify(data))

    socket.onmessage = function(evt) {
        let data = JSON.parse(evt.data)
        if (data.funcCode == '0') {
            console.log("注册失败")
        } else if (data.funcCode == '1') {
            console.log("注册成功")
            console.log("当前用户：" + data.current_user)
        } else {
            console.log("服务器无响应")
        }
    }
}



// 用户登录账号，funcCode == 5
function login (username, password) {
    let data = {
        'funcCode': '5',
        'username': username,
        'password': password,
    }
    socket.send(JSON.stringify(data))

    // TO BE DELETED check 输出
    console.log(JSON.stringify(data))

    socket.onmessage = function(evt) {
        let data = JSON.parse(evt.data)
        if (data.funcCode == '0') {
            console.log("登录失败")
            console.log(data.error)
        } else if (data.funcCode == '1') {
            console.log("登录成功")
            console.log("当前用户：" + data.current_user)
        }
    }
}



// 用户请求下线，funcCode == 6
function logout () {
    let data = {
        'funcCode': '6',
    }
    socket.send(JSON.stringify(data))
    console.log(JSON.stringify(data))

    socket.onmessage = function(evt) {
        let data = JSON.parse(evt.data)
        if (data.funcCode == '0') {
            console.log("下线失败，请重试")
        } else if (data.funcCode == '1') {
            console.log("当前用户 " + data.current_user + " 已下线")
        }
    }
}



// 请求上传上传本地进度，funcCode == 8
function upload_game_data () {
    let data = {
        'funcCode': '8',
        'games': []
    }
    let games = []
    for (let i = 0; i < localStorage.length; i++) {
        games[i] = {'gameName': localStorage.key(i), 'xml':localStorage.getItem(localStorage.key(i))}
    }
    data.games = games
    socket.send(JSON.stringify(data))

    // TO BE DELETED check 输出
    console.log(JSON.stringify(data))

    socket.onmessage = function(evt) {
        let response = JSON.parse(evt.data)
        if (response.funcCode == 0) {
            console.log("发送本地游戏数据失败")
        } else if (response.funcCode == 1) {
            console.log("发送本地游戏数据成功")
        } else {
            console.log("因为其它原因发送失败")
        }
    }
}



// 客户端请求服务器发送云端地游戏进度，funcCode == 9
function download_game_data () {
    let data = {
        'funcCode': '9'
    }

    socket.send(JSON.stringify(data))
    // TO BE DELETED check 输出
    console.log('拉取请求已提交')

    // 收取服务器的反馈
    // (1) 如果服务器返回的 funcCode == 0，即错误返回，就发一个警告
    // (2) 如果服务器返回的 funcCode == 1，则解析返回数据中的内容并与本地做对比，
    //                                 云端如果更多就用云端，本地多就提示是否 overwrite localStorage
    socket.onmessage = function (evt) {
        let response = JSON.parse(evt.data)
        if (response.funcCode == 0) {
            console.log("CLIENT: 请求拉取游戏进度失败，云端没有存档")
        } else if (response.funcCode == '1') {
            console.log("CLIENT: 请求拉取云端游戏数据成功")
            let len = response.games.length
            for (let i = 0; i < len; i++) {
                window.localStorage.setItem(response.games[i].gameName, response.games[i].xml)
                console.log(response.games[i].gameName,response.games[i].xml)
            }
            console.log("CLIENT: 游戏存档已成功储存至本地")
        } else if (response.funcCode == '2') {
            console.log("CLIENT: 用户未登录")
        } else {
            console.log("CLIENT: 发生未知错误")
        }
    }
}



// 客户端请求服务器端清空游戏存档，funcCode == 10
function clear_server_game_content () {
    let data = {
        'funcCode': '10',
    }
    socket.send(JSON.stringify(data))
    console.log(JSON.stringify(data))

    // 这个地方或许应该加一个弹窗 alert

    socket.onmessage = function(evt) {
        let data = JSON.parse(evt.data)
        if (data.funcCode == '0') {
            console.log("清空失败，请重试")
        } else if (data.funcCode == '1') {
            console.log("当前用户 " + data.current_user + " 的云存档已经清空")
        }
    }
}



// 在集成到 HTML 之前，这就是测试模块
socket.onopen = function () {
    // login("newton", '123456')
}
