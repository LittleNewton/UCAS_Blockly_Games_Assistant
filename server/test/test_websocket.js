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

    it("yanyue should insert success", function(){
        var SQL_insert_user = websocket.__get__('SQL_insert_user')
        SQL_insert_user('yanyue', '12345', function (resp){
            // 根据 callback 的resp参数来确定返回值
            if (resp === 'USERNAME_INVALID'){
                assert.ok(true)    // 默认成功
            } else if(resp === 'REG_SUCCESS'){
                assert.ok(false)
            }
        })
    })

    it("yanyue again should insert false, 不能重复注册", function(){
        var SQL_insert_user = websocket.__get__('SQL_insert_user')
        SQL_insert_user('yanyue', '12345', function (resp){
            // 根据 callback 的resp参数来确定返回值
            if (resp === 'USERNAME_INVALID'){
                assert.ok(false)
            } else if(resp === 'REG_SUCCESS'){
                assert.ok(true)
            }
        })
    })

})