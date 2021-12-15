/*
 * 文件名：inject.js
 * 创建时间：2021 Sept. 23
 * 修改时间：2021 Dec.  15
 * 作者：刘鹏
 * 文件描述：类 Chrome 浏览器的前端代码
 */



/*
 * 与 Extension Background | Popup menu 建立联系
 */
// const extension_id = 'dfmjeebfbdhhodlbmilkpdbcbmbhedea'
const extension_id = 'abpilfbfomcllhheghclnlhgkhadlpop'
let port_I2B = chrome.runtime.connect(extension_id, {name: "I2B"});


/*
 * 注入脚本主动连接 background 并得到 port 对象，此后一直侦听 port 上的 message
 * 根据 message 的 Code 字段判别请求类型并予以反馈
 */
port_I2B.onMessage.addListener (function (msg) {
    console.log('收到 Background 的消息')
    console.log(msg.Code)

    switch (msg.Code) {

        /*
         * 用户请求将本地 game 数据发送到服务器
         */
        case ('give_me_localStorage') : {
            let port_I2B_response_data = {
                Code: 'game_data',
                games: []
            }

            // 提取 localStorage
            let games = []
            for (let i = 0; i < localStorage.length; i++) {
                games[i] = {'gameName': localStorage.key(i), 'xml':localStorage.getItem(localStorage.key(i))}
            }
            port_I2B_response_data.games = games

            // 将本地数据反馈给 background
            port_I2B.postMessage(port_I2B_response_data)
            break
        }



        /*
         * 服务器传过来了数据
         */
        case ('please_store_the_game_data') : {
            let games = msg.games
            for (let i = 0; i < games.length; i++) {
                window.localStorage.setItem(msg.games[i].gameName, msg.games[i].xml)
                console.log(msg.games[i].gameName,msg.games[i].xml)
            }

            let port_I2B_response_data = {
                Code: 'OK',
            }
            port_I2B.postMessage(port_I2B_response_data)
            break
        }

        default: {
            console.log("Injected Scripts: 与 background.js 通信发生错误")
        }
    }
})
