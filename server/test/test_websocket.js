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