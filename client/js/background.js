/*
 * 文件名：background.js
 * 创建时间：2021 Dec. 14
 * 修改时间：2021 Dec. 15
 * 作者：刘鹏
 * 文件描述：类 Chrome 浏览器 Extension 的 background 脚本
 */



/*
 * 与服务器建立 webSocket 连接
 */
let socket = undefined



/*
 * 侦听器，接受 inject scripts 的连接并将 port 对象传给全局变量
 * 接受各种外部 Chrome Tab 的请求
 */
let port_I2B = undefined
chrome.runtime.onConnectExternal.addListener(function(port) {
    // port 定义务必满足要求
    console.assert(port.name === 'I2B')
    port_I2B = port
    console.log('BG: 已与 blockly 前台建立连接')
})



/*
 * 请求注册账户：
 *                funcCode = 4
 */
function register (username, password, callback) {
    let data = {
        'funcCode': '4',
        'username': username,
        'password': password,
        'data_pack': ''
    }
    socket = new WebSocket('ws://localhost:9999')
    socket.onopen = () => {
        socket.send(JSON.stringify(data))

        // TO BE DELETED check 输出
        console.log(JSON.stringify(data))

        socket.onmessage = function(evt) {
            let data = JSON.parse(evt.data)
            if (data.funcCode == '0') {
                console.log('注册失败')
                callback('ERROR')
            } else if (data.funcCode == '1') {
                console.log('注册成功')
                console.log('当前用户：' + data.current_user)
                callback('ONLINE')
            } else {
                console.log('服务器无响应')
            }
        }
    }
}



/*
 * 请求登录账号：
 *                funcCode = 5
 */
function login (username, password, callback) {
    let data = {
        'funcCode': '5',
        'username': username,
        'password': password,
    }
    socket = new WebSocket('ws://localhost:9999')
    socket.onopen = () => {
        socket.send(JSON.stringify(data))

        // TO BE DELETED check 输出
        console.log(JSON.stringify(data))
    
        socket.onmessage = function(evt) {
            let data = JSON.parse(evt.data)
            if (data.funcCode == '0') {
                console.log('登录失败')
                console.log(data.error)
                callback('ERROR')
            } else if (data.funcCode == '1') {
                console.log('登录成功')
                console.log('当前用户：' + data.current_user)
                callback('ONLINE')
            }
        }
    }
}



/* 
 * 用户请求下线：
 *                funcCode == 6
 */
function logout (callback) {
    let data = {
        'funcCode': '6',
    }
    socket.send(JSON.stringify(data))
    console.log(JSON.stringify(data))

    socket.onmessage = function(evt) {
        let data = JSON.parse(evt.data)
        if (data.funcCode == '0') {
            callback('ERROR')
            console.log('下线失败，请重试')
        } else if (data.funcCode == '1') {
            socket.close()
            console.log('当前用户 ' + data.current_user + ' 已下线')
            callback('OFFLINE')
        } else {
            callback('ERROR')
        }
    }
}



/*
 * 用户请求服务器端清空游戏存档：
 *                funcCode == 10
 */
function clear_server_game_content () {
    let data = {
        'funcCode': '10',
    }
    socket.send(JSON.stringify(data))
    console.log(JSON.stringify(data))

    socket.onmessage = function(evt) {
        let data = JSON.parse(evt.data)
        if (data.funcCode == '0') {
            console.log('清空失败，请重试')
        } else if (data.funcCode == '1') {
            console.log('当前用户 ' + data.current_user + ' 的云存档已经清空')
        }
    }
}



/*
 * 在 popup 窗口的触发下 (上传)，
 * Content Scripts 获取了 blockly.games 页面的 localStorage，
 * 在此要将之传送到服务器
 * 
 *     NOTE: 为什么要把 addListener 写在函数里呢？要理解这一点可以想象一下你通过管子给楼上的邻居发消息
 *           我用力敲一下管子 (postMessage)，然后赶紧把耳朵贴近管子，听听楼上的反馈 (Listen)，就这么简单。
 * 
 *              funcCode == 8 
 *      and
 *              funcCode == 9
 */
function resolve_game_data (action) {
    if (port_I2B === undefined) {
        console.assert ('Background: 用户未打开 blockly.games 或用户未连接 background.js')
    } else {
        switch (action) {

            /*
             * 请求 Injected Scripts 发送 localStorage
             */
            case ('read') : {
                let port_data = {
                    'Code': 'read'
                }
                port_I2B.postMessage (port_data)
                break
            }

            /*
             * 请求 Injected Scripts 写入 localStorage
             */
            case ('write') : {
                // 向服务器请求下载用户的数据
                let data = {
                    'funcCode': '9'
                }
                socket.send(JSON.stringify(data))
                console.log('拉取请求已提交')

                // 收取服务器的反馈
                // (1) 如果服务器返回的 funcCode == 0，即错误返回，就发一个警告
                // (2) 如果服务器返回的 funcCode == 1，则解析返回数据中的内容并与本地做对比，
                //                                  增量同步，本地比云多的部分被保留，本地比云少的被填充
                socket.onmessage = function (evt) {
                    let response = JSON.parse(evt.data)
                    if (response.funcCode == 0) {
                        console.log('CLIENT: 请求拉取游戏进度失败，云端没有存档')
                    } else if (response.funcCode == '1') {
                        console.log('CLIENT: 请求拉取云端游戏数据成功')
                        
                        // 与 Injected Script 通信，发送云端下载的游戏数据
                        let port_data = {
                            'Code': 'write',
                            'games': []
                        }
                        port_data.games = response.games
                        port_I2B.postMessage (port_data)
                    } else if (response.funcCode == '2') {
                        console.log('CLIENT: 用户未登录')
                    } else {
                        console.log('CLIENT: 发生未知错误')
                    }
                }
        
                break
            }

            default: {
                console.log('RESOLVE: 未能识别的操作')
            }
        }


        // 侦听 Injected Scripts 的 feedback
        port_I2B.onMessage.addListener (function (msg) {

            switch (msg.Code) {
                case ('read_done') : {
                    console.log('Inject Script 发来的游戏数据是：' + msg.games)

                    let data = {
                        'funcCode': '8',
                        'games': []
                    }
                    data.games = msg.games
        
                    // socket 发送到服务器
                    socket.send(JSON.stringify(data))
                    socket.onmessage = function(evt) {
                        let response = JSON.parse(evt.data)
        
                        if (response.funcCode == 0) {
                            console.log('发送本地游戏数据失败')
                        } else if (response.funcCode == 1) {
                            console.log('发送本地游戏数据成功')
                        } else {
                            console.log('因为其它原因发送失败')
                        }
                    }
                    break
                }

                case ('write_done') : {
                    console.log('CLIENT: 游戏存档已成功储存至本地')
                    break
                }

                default: {
                    console.log('RESOLVE: 发生未知错误')
                }
            }
        })
    }
}
