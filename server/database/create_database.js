var sqlite3 = require('sqlite3');

// TO DO
// 有关数据库创建这一块，还有很多工作要做。比如，是直接以用户名为 index，还是
// 以 random_id 为索引。这是个需要好好讨论的问题。
var db = new sqlite3.Database('gamer.db', function() {
    // 创建 用户名、密码的存储表
    db.run("CREATE TABLE IF NOT EXISTS USER(name varchar(32) PRIMARY KEY, password_hash varchar(16) NOT NULL)", function() {
        db.all("SELECT name FROM USER WHERE name = 'yanyue'", function(err, res){
            if(!err) {
                if (res.length == 0) {
                    console.log("数据库中没有这个用户")
                } else {
                    console.log('查到了用户：', res[0].name);
                }
            }
            else
                console.log('出错了');
        });
    });
});
