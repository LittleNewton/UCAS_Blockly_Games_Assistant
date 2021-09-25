/*
 * 文件名：Server.js
 * 创建时间：2021 Sept. 23
 * 作者：刘鹏
 * 文件描述：Node.js 后端代码，用于提供用户服务
 */


/*
 * 引入 node.js 组件
 */
var express = require('express');
var sqlite3 = require('sqlite3');
var fs      = require('fs');
var WebSocketServer = require('ws').Server



/* 
 * 注册|打开 数据库
 */
var file = 'database/Gamer.db';
var exists = fs.existsSync(file);
var db = new sqlite3.Database(file)



/*
 * 注册 webSocket 服务器
 */
var app = express()
app.use(express.static(__dirname))
app.listen(3000)
var webSocketServer = new WebSocketServer({ port: 9999 })



// ws (webSocket) 代表一个客户端，每个连接进来的客户端都有一个 ws
webSocketServer.on('connection', function connection(ws) {
    // ROUTINE: 连接建立
    console.log('客户端连接成功')

    // 监听对方发过来的 json
    ws.on('message', function incomming(message) {
        var data = JSON.parse(message);
        console.log('============ NEW MESSAGE RECEIVED ============');
        console.log('接收到客户端的 message');

        // TO DO : 以下所有的函数，都应该用 try 语句来写！否则服务端容易崩溃

        // 如果有人要注册
        if (data.funcCode == 4) {
            console.log('有新用户想要注册');
            username = data.username;
        }


        // 如果有用户要登录
        if (data.funcCode == 5) {
            console.log("有用户要登录~");
            if (data.username == 'newton' && data.password == '123456') {
                data_respond = {'funcCode': 1}
                ws.send(JSON.stringify(data_respond));
            }
        }
    })
})
