/*
 * 文件名：Server.js
 * 创建时间：2021 Sept. 23
 * 修改时间：2021 Dec.  05
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
var file_db_user = 'blockly_gamers.db';
var exists = fs.existsSync(file_db_user);
var db = new sqlite3.Database(file_db_user);



/*
 * 初始化两个数据库
 */
function initDB () {
    var sql_create_table_user = db.prepare("CREATE TABLE IF NOT EXISTS USER(name varchar(32) PRIMARY KEY, password_hash varchar(16) NOT NULL)");
    sql_create_table_user.run();
    var sql_create_table_game = db.prepare("CREATE TABLE IF NOT EXISTS GAME(name varchar(32), game varchar(32), datetime text, content text, PRIMARY KEY (name, game, datetime))")
    sql_create_table_game.run();
}
initDB();



/*
 * 检查用户发送过来的 username 是否合法
 * (1) 形式合法
 * (2) 与数据库中的已有数据不冲突
 */
function SQL_user_exist(username) {

    // STEP 1: 检查 username 长度是否合法
    if (username.length > 32 || username.length < 3) {
        console.log("用户名过长或过短");
        // TO DO: 在 HTML 里把这部分的反馈写上去，如 alert('用户名非法')
        return false;
    }

    // STEP 2: 检查 username 样式是否合法
    var re = new RegExp("^[a-zA-Z_][0-9a-zA-Z@\.]*$");
    if(re.exec(username) == null) {
        console.log("用户名形式不合法");
        return false;
    }

    // STEP 3: 检查数据库中是否已经包含这个 username
    var sql_check_username = "SELECT name FROM USER WHERE name = " + username;
    db.run(sql_check_username, function (res, err) {
        if (!err) {
            // 没有查到才是我们期望的！
            console.log("错误码：", err);
            console.log("Sqlite3: 数据库未检测到用户名冲突。");
            return true;
        } else {
            console.log("返回值：", res);
            return false;
        }
    });
}



/*
 * 添加一个新用户
 * (1) 添加用户
 * (2) 返回：
 *          true    :: 成功
 *          false   :: 失败
 */
function SQL_insert_user(username, password) {
    let sql_insert_user = 'INSERT INTO USER VALUES (' + username + ',' + password + ')';
    db.run(sql_insert_user, function(res, err) {
        if (!err) {
            console.log("插入 username 不成功。");
            console.log("错误码：", err);
        } else {
            console.log("返回值：", res);
        }
    });
    console.log(sql_insert_user);
}


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
    let isLogin = false;

    // 监听对方发过来的 json
    ws.on('message', function incomming(message) {
        let data = JSON.parse(message);
        console.log('============ NEW MESSAGE RECEIVED ============');
        console.log('接收到客户端的 message');

        // TO DO : 以下所有的函数，都应该用 try 语句来写！否则服务端容易崩溃

        // 如果发起连接时，funcCode 不是登录、注册，且当前没有登录，则驳回所有请求
        if (isLogin == false && (data.funcCode != 4 || data.funcCode != 5)) {
            console.log("该发起连接的用户未登录，操作非法");
            let data_respond = {'funcCode': 0};
            ws.send(JSON.stringify(data_respond));
        }


        // 如果有人要注册
        if (data.funcCode == 4) {
            console.log('有新用户想要注册');
            let username = data.username;
            let password = data.password;

            if (SQL_user_exist(username)) {
                console.log("Server: 允许注册用户");
                SQL_insert_user(username, password);
                let data_respond = {'funcCode': 1};
                ws.send(JSON.stringify(data_respond));
            }
        }



        // 如果有用户要登录
        if (data.funcCode == 5) {
            console.log("有用户要登录~");
            if (data.username == 'newton' && data.password == '123456') {
                let data_respond = {'funcCode': 1}
                ws.send(JSON.stringify(data_respond));
            }
            isLogin = true;
        }



        // 如果有用户要发送游戏数据
        if (data.funcCode == 8) {
            console.log("有用户要发送数据");
            if (isLogin == true) {
                console.log(data);
            } else {
                let data_respond = {'funcCode': 0}
                console.log("因为用户没有登录，所以驳回该请求！");
                ws.send(JSON.stringify(data_respond));
            }
        }



        // 如果用户要下载云端的游戏数据
        if (data.funcCode == 9) {
            console.log("有用户要发送数据");
            if (isLogin == true) {
                console.log("");
                let data_respond = {'funcCode': 1, games}
                ws.send(JSON.stringify(data_respond));
            } else {
                let data_respond = {'funcCode': 0}
                console.log("因为用户没有登录，所以驳回该请求！");
                ws.send(JSON.stringify(data_respond));
            }
        }
    })
})



const games = [
    {'gameName':'maze1', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"></block></statement></block></xml>'},
    {'gameName':'maze2', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_moveForward"><next><block type="maze_turn"><field name="DIR">turnLeft</field><next><block type="maze_moveForward"><next><block type="maze_turn"><field name="DIR">turnRight</field><next><block type="maze_moveForward"></block></next></block></next></block></next></block></next></block></xml>'},
    {'gameName':'maze3', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"></block></statement></block></xml>'},
    {'gameName':'maze4', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_turn"><field name="DIR">turnLeft</field><next><block type="maze_moveForward"><next><block type="maze_turn"><field name="DIR">turnRight</field></block></next></block></next></block></next></block></statement></block></xml>'},
    {'gameName':'maze5', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_moveForward"><next><block type="maze_moveForward"><next><block type="maze_turn"><field name="DIR">turnLeft</field><next><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"></block></statement></block></next></block></next></block></next></block></xml>'},
    {'gameName':'maze6', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_if"><field name="DIR">isPathLeft</field><statement name="DO"><block type="maze_turn"><field name="DIR">turnLeft</field></block></statement></block></next></block></statement></block></xml>'},
    {'gameName':'maze7', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_forever"><statement name="DO"><block type="maze_moveForward"><next><block type="maze_if"><field name="DIR">isPathRight</field><statement name="DO"><block type="maze_turn"><field name="DIR">turnRight</field></block></statement></block></next></block></statement></block></xml>'},
    {'gameName':'maze8', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_forever"><statement name="DO"><block type="maze_if"><field name="DIR">isPathForward</field><statement name="DO"><block type="maze_moveForward"></block></statement><next><block type="maze_if"><field name="DIR">isPathLeft</field><statement name="DO"><block type="maze_turn"><field name="DIR">turnLeft</field></block></statement><next><block type="maze_if"><field name="DIR">isPathRight</field><statement name="DO"><block type="maze_turn"><field name="DIR">turnRight</field></block></statement></block></next></block></next></block></statement></block></xml>'},
    {'gameName':'maze9', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_forever"><statement name="DO"><block type="maze_ifElse"><field name="DIR">isPathForward</field><statement name="DO"><block type="maze_moveForward"></block></statement><statement name="ELSE"><block type="maze_if"><field name="DIR">isPathLeft</field><statement name="DO"><block type="maze_turn"><field name="DIR">turnLeft</field></block></statement></block></statement></block></statement></block></xml>'},
    {'gameName':'maze10', 'xml':'<xml xmlns="https://developers.google.com/blockly/xml"><block type="maze_forever"><statement name="DO"><block type="maze_ifElse"><field name="DIR">isPathLeft</field><statement name="DO"><block type="maze_turn"><field name="DIR">turnLeft</field><next><block type="maze_moveForward"></block></next></block></statement><statement name="ELSE"><block type="maze_ifElse"><field name="DIR">isPathForward</field><statement name="DO"><block type="maze_moveForward"></block></statement><statement name="ELSE"><block type="maze_turn"><field name="DIR">turnRight</field></block></statement></block></statement></block></statement></block></xml>'},
];
const game_data = {games}
