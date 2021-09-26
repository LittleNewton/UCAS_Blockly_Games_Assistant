/*
 * 文件名：Server.js
 * 创建时间：2021 Sept. 23
 * 作者：刘鹏
 * 文件描述：Node.js 后端代码，用于提供用户服务
 */



/*
 * 引入 node.js 组件
 */
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();



/* 
 * 注册|打开 数据库
 */
var file_db_user = 'gamer.db';
var exists = fs.existsSync(file_db_user);
var db = new sqlite3.Database(file_db_user);



/*
 * 初始化两个数据库
 */

var sql_create_table_user = db.prepare("CREATE TABLE IF NOT EXISTS USER(name varchar(32) PRIMARY KEY, password_hash varchar(16) NOT NULL)");
sql_create_table_user.run();
var sql_create_table_game = db.prepare("CREATE TABLE IF NOT EXISTS GAME(name varchar(32), game varchar(32), datetime text, content text, PRIMARY KEY (name, game, datetime))")
sql_create_table_game.run();

var sql_check_username = "SELECT name FROM USER WHERE name = " + 'newton';
db.run(sql_check_username, function(res, err) {
    if (!err) {
        console.log("错误值：", err);
    } else {
        console.log("返回值：", res);
    }
})
// console.log(sql_check_username);


/*
 * 检查用户发送过来的 username 是否合法
 * (1) 形式合法
 * (2) 与数据库中的已有数据不冲突
 */
function check_username (username) {

    // STEP 1: 检查 username 长度是否合法
    if (length(username) > 32 || length(username) < 3) {
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
    var sql_check_username = db.prepare("SELECT name FROM USER WHERE name = " + username);
    sql_check_username.run();
    console.log(sql_check_username);
}
