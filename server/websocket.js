/*
 * 文件名：Server.js
 * 创建时间：2021 Sept. 23
 * 修改时间：2021 Dec.  07
 * 作者：刘鹏
 * 文件描述：Node.js 后端代码，用于提供用户服务
 */



/*
 * 引入 node.js 组件
 */
const express           = require('express')
const sqlite3           = require('sqlite3')
const fs                = require('fs')
const crypto            = require('crypto')
const WebSocketServer   = require('ws').Server



/*
 * 注册 webSocket 服务器
 */
const app = express()
app.use(express.static(__dirname))
app.listen(3000)
const webSocketServer = new WebSocketServer({ port: 9999 })



/* 
 * 注册 or 打开 数据库
 */
const file_db_user = 'blockly_gamers.db'
const db = new sqlite3.Database(file_db_user)



/*
 * 初始化数据库
 */
function initDB (dbIn) {
    // （如果不存在则创建）用户表：用户名、密码哈希
    const sql_create_table_user = dbIn.prepare("CREATE TABLE IF NOT EXISTS USER(name varchar(32) PRIMARY KEY, password_hash text NOT NULL, salt text NOT NULL)")
    sql_create_table_user.run()
    // （如果不存在则创建）游戏表：
    const sql_create_table_game = dbIn.prepare("CREATE TABLE IF NOT EXISTS GAME(name varchar(32), game varchar(32), content text, PRIMARY KEY (name, game))")
    sql_create_table_game.run()
    return true
}
initDB(db)



/*
 * 检查用户发送过来的 username 是否合法
 * 形式合法?
 *      true:   合法
 *      false:  不合法
 */
function username_valid(username) {

    // STEP 1: 检查用户名是否为空
    if (username == null) {
        console.log('Name-Checker: 用户名为空')
        return false
    }

    // STEP 2: 检查 username 长度是否合法
    if (username.length > 32 || username.length < 3) {
        console.log('Name-Checker: 用户名 ' + username + ' 过长或过短')
        // TO DO: 在 HTML 里把这部分的反馈写上去，如 alert('用户名非法')
        return false
    }

    // STEP 3: 检查 username 样式是否合法
    const re = new RegExp("^[a-zA-Z_][0-9a-zA-Z@\.]*$")
    if(re.exec(username) == null) {
        console.log('Name-Checker: 用户名 ' + username + ' 形式不正确')
        return false
    }

    console.log('Name-Checker: 用户名 ' + username + ' 形式合法')
    return true
}



/*
 * 添加一个新用户
 * (1) 添加用户
 * (2) 返回：
 *          true    :: 成功
 *          false   :: 失败
 */
function SQL_insert_user(username, password, callback) {

    // password 做哈希加盐
    const salt = crypto.randomBytes(128).toString('base64')
    const password_hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('base64')

    let sql_insert_user = 'INSERT INTO USER VALUES (\'' + username + '\', \'' + password_hash + '\', \'' + salt + '\');'
    db.run(sql_insert_user, [], function (res, err) {
        // errno 19: 用户名冲突
        if (res == null) {
            callback('REG_SUCCESS')
        } else if (res.errno == 19)  {
            callback('USERNAME_INVALID')
        } else {
            console.log('DB: 未知的错误')
        }
    })
    console.log('DB: ' + sql_insert_user)
}



/*
 * 根据用户名查询是否存在该用户
 *  (1) 存在，则返回用户的密码
 *  (2) 不存在，则返回 err
 */
function SQL_query_user_info (username, callback) {
    let sql_query_user = 'SELECT password_hash, salt FROM USER WHERE name = \'' + username + '\';'
    db.all(sql_query_user, [], function(err, rows) {
        if (err) {
            console.log(err)
            return
        } else if (rows.length != 0){
            callback(rows[0].password_hash, rows[0].salt)
        } else {
            console.log('DB: 数据库中查无此人')
            return
        }
    })
}



/*
 * 写入游戏数据库
 *  (1) 更新存档
 *  (2) 保存存档
 */
function SQL_insert_game_info (username, gamedata, callback) {
    for (let i = 0; i < gamedata.length; i++) {
        let sql_insert_game_info = 'INSERT OR IGNORE INTO GAME VALUES (\'' + username + '\', \'' + gamedata[i].gameName + '\', \'' + gamedata[i].xml + '\');'
        console.log('DB: ' + sql_insert_game_info)
        db.run(sql_insert_game_info)
    }
}



/*
 * 读取游戏数据库中的存档
 */
function SQL_get_game_info (username, callback) {
    let sql_get_game_info = 'SELECT game, content FROM GAME WHERE name = \'' + username +'\';'
    let games = []
    db.all(sql_get_game_info, [], function(err, rows) {
        if (err) {
            console.log(err)
        } else if (rows.length != 0){
            for (let i = 0; i < rows.length; i++) {
                games[i] = {'gameName': rows[i].game, 'xml':rows[i].content}
            }
            callback(games)
        } else {
            // TO-DO: 查不到数据也得给反馈
            console.log('DB: 数据库中没有当前用户的数据')
        }
    })
}



function SQL_delete_user_game_content (username, callback) {
    let sql_delete_user_game_content = 'DELETE FROM GAME where name = \'' + username + '\';'
    db.all(sql_delete_user_game_content)
    console.log('DB: 用户 ' + username + ' 的游戏存档已删除')
    callback ('DELETE_SUCCESS')
}



// ws (webSocket) 代表一个客户端，每个连接进来的客户端都有一个 ws
webSocketServer.on('connection', function connection(ws) {
    // ROUTINE: 连接建立
    console.log('SERVER: 客户端连接成功')

    // 两个重要的全局变量
    let isLogin = false
    let current_user = ''

    // 监听对方发过来的 json
    ws.on('message', function incomming(message) {
        let data = JSON.parse(message)
        console.log('============ NEW MESSAGE RECEIVED ============')
        console.log('SERVER: 接收到客户端的消息')

        // TO DO : 以下所有的函数，都应该用 try 语句来写！否则服务端容易崩溃

        // 如果发起连接时，funcCode 不是登录、注册，且当前没有登录，则驳回所有请求
        if (!isLogin && (data.funcCode != '4' && data.funcCode != '5')) {
            console.log("SERVER: 该发起连接的用户未登录，操作非法")
            let data_respond = {'funcCode': '2'}
            ws.send(JSON.stringify(data_respond))
        } else {

            switch (data.funcCode) {

                // 有游客要注册
                case  '4': {
                    console.log('有新用户想要注册')
                    let username = data.username
                    let password = data.password

                    if (username_valid(username)) {
                        console.log("SERVER: 尝试注册用户")
                        SQL_insert_user(username, password, function (resp) {
                            if (resp == 'USERNAME_INVALID') {
                                let data_respond = {'funcCode': '0'}
                                ws.send(JSON.stringify(data_respond))
                                console.log("SERVER: 该用户名已被注册")
                            } else if (resp == 'REG_SUCCESS') {
                                isLogin = true
                                current_user = username
                                let data_respond = {'funcCode': '1', 'current_user': current_user}
                                ws.send(JSON.stringify(data_respond))
                                console.log("SERVER: 用户已注册成功，并同时为该用户登录")
                            }
                        })
                    }
                    break
                }

                // 有用户要登录
                case '5': {
                    console.log("SERVER: 有用户要登录~")
                    let username = data.username
                    let password = data.password

                    if (isLogin && current_user == username) {
                        console.log('SERVER: 该用户已登录')
                        let data_respond = {'funcCode': '1', 'current_user': current_user + ' 已登录'}
                        ws.send(JSON.stringify(data_respond))
                    } else if (username_valid(username)) {
                        SQL_query_user_info(username, function (passwd_hash_in_DB, salt) {
                            if (crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('base64') != passwd_hash_in_DB) {
                                console.log('SERVER: 用户输入的密码错误！')
                                let data_respond = {'funcCode': '0', 'error': '用户名或密码错误'}
                                ws.send(JSON.stringify(data_respond))
                                ws.close()
                                console.log('WebSocket 连接已关闭')
                            } else {
                                isLogin = true
                                current_user = username
                                let data_respond = {'funcCode': '1', 'current_user': current_user}
                                ws.send(JSON.stringify(data_respond))
                                console.log('SERVER: 用户密码正确，允许登录！')
                            }
                        })
                    }
                    break
                }

                // 当前用户请求下线
                case '6': {
                    console.log("SERVER: 当前用户请求下线")
                    isLogin = false

                    let data_respond = {'funcCode': '1', 'current_user': current_user}
                    ws.send(JSON.stringify(data_respond))
                    ws.close();
                    console.log('WebSocket 连接已关闭')
                    break
                }

                // 当前用户要发送游戏数据存档
                case '8': {
                    console.log("SERVER: 有用户要发送游戏数据")
                    let game_data = data.games

                    // 判断 data.games 字段的长度，防止有人乱发东西，必要的时候加 SQL 注入防护
                    if (game_data === undefined || game_data.length == 0 || Object.keys(game_data[0]).length != 2) {
                        console.log('SERVER: 游戏存档非法，已拒绝')
                        let data_respond = {'funcCode': '0'}
                        ws.send(JSON.stringify(data_respond))
                    } else {
                        SQL_insert_game_info(current_user, game_data, function () {
                            console.log("SERVER: 写入游戏数据")
                            let data_respond = {'funcCode': '1'}
                            ws.send(JSON.stringify(data_respond))
                        })
                    }
                    break
                }

                // 当前用户请求下载云端备份
                case '9': {
                    console.log("SERVER: 有用户请求下载云端游戏数据")
                    SQL_get_game_info(current_user, function (games) {
                        let data_respond = {'funcCode': '1', games}
                        ws.send(JSON.stringify(data_respond))
                    })
                    break
                }

                // 当前用户请求清空服务器保存的游戏进度
                case '10': {
                    console.log("SERVER: 当前用户请求清空服务器保存的游戏进度")

                    // 从数据库里删除所有用户名为 USER 的游戏数据
                    SQL_delete_user_game_content(current_user, function (res) {
                        if (res == 'DELETE_SUCCESS') {
                            let data_respond = {'funcCode': '1'}
                            ws.send(JSON.stringify(data_respond))
                        } else {
                            let data_respond = {'funcCode': '0'}
                            ws.send(JSON.stringify(data_respond))
                            console.log('SERVER: 游戏进度清空失败')
                        }
                    })
                    break
                }

                // 默认
                default: {
                    let data_respond = {'funcCode': '0', 'error': 'funcCode 无法解析'}
                    ws.send(JSON.stringify(data_respond))
                    ws.close()
                    console.log('WebSocket 连接已关闭')
                    console.log('SERVER: 未识别的 funcCode，连接已关闭')
                }
            }
        }
    })
})
