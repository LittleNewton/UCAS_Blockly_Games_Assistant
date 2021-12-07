var assert = require('assert')
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when value is not present', function() {
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });
});

var calc = require('../js/calc.js')

describe('calc test', function(){
    describe('add', function(){
        it('return 1+1 = 2', function(){
            assert.equal(calc.add(1,1), 2);
            // done();
        });
    });
});

// var webSocket = require('../websocket.js')
// describe('web test', function(){
//     describe('name check', function(){
//         it('return true for yanyue', function(){
            
//         });
//     });
// });