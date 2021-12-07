var assert = require('assert')
var rewire = require('rewire')
var websocket = rewire('../websocket')

describe("valid username", function(){
    var username_valid = websocket.__get__('username_valid')
    it("yanyue should be right", function(){
        var out = username_valid("yanyue")
        assert.equal(out, true)
    })
    it("a should be false 长度太短", function(){
        assert.equal(username_valid("a"), false)
    })
    it("none should be false", function(){
        assert.equal(username_valid(), false)
    })
    it("#$ should be false 非法字符", function(){
        assert.equal(username_valid("#$"), false)
    })
    it("yanyue@171 should be right, 合法字符", function(){
        var out = username_valid("yanyue@171")
        assert.equal(out, true)
    })
})


sqlite3 = require('sqlite3')
describe("test db", function(){
    db = new sqlite3.Database('test.db')

    it("should create db success", function(){
        var initDB = websocket.__get__('initDB')
        var out = initDB(db)
        assert.equal(out, true)
    })

    // var callback = function(word){ console.log(word) }
    // it("should insert success", function(){
    //     var SQL_insert_user = websocket.__get__('SQL_insert_user')
    //     var out = SQL_insert_user('yanyue', '12345', callback)
    //     assert.equal(out, true)
    // })

    
    // let sql_insert_user = 'INSERT INTO USER VALUES (\'' + 'username' + '\',\'' + 'password' + '\');'
    // db.run(sql_insert_user)
})