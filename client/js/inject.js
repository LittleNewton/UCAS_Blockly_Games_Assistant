/*
 * 文件名：inject.js
 * 创建时间：2021 Sept. 23
 * 修改时间：2021 Dec.  05
 * 作者：刘鹏
 * 文件描述：类 Chrome 浏览器的前端代码
 */



/*
 * Let's get started
 */

console.log("让我们开始！ from inject.js")



/*
 * 与服务器建立 webSocket 连接
 */
let socket = new WebSocket('ws://localhost:9999');



// 请求注册账户，funcCode = 4
function register (username, password) {
    let data = {
        'funcCode': 4,
        'username': username,
        'password': password,
        'data_pack': ""
    }
    socket.send(JSON.stringify(data))

    // TO BE DELETED check 输出
    console.log(JSON.stringify(data))

    socket.onmessage = function(evt) {
        let data = JSON.parse(evt.data);
        if (data.funcCode == 0) {
            console.log("注册失败");
        } else if (data.funcCode == 1) {
            console.log("注册成功");
        } else {
            console.log("服务器无响应");
        }
    }
}



// 用户登录账号，funcCode == 5
function login(username, password) {
    let data = {
        'funcCode': 5,
        'username': username,
        'password': password,
        'data_pack': ""
    }
    socket.send(JSON.stringify(data))

    // TO BE DELETED check 输出
    console.log(JSON.stringify(data))

    socket.onmessage = function(evt) {
        let data = JSON.parse(evt.data);
        if (data.funcCode == 0) {
            console.log("登录失败");
        } else if (data.funcCode == 1) {
            console.log("登录成功");
        }
    }
}



// 请求上传上传本地进度，funcCode == 8
function upload_game_data () {
    let data = {
        'funcCode': 8,
        games,
    }
    let games = []
    for (let i = 0; i < localStorage.length; i++) {
        games[i] = {'gameName': localStorage.key(i), 'game_xml':localStorage.getItem(localStorage.key(i))};
    }
    socket.send(JSON.stringify(data))

    // TO BE DELETED check 输出
    console.log(JSON.stringify(data))

    socket.onmessage = function(evt) {
        let response = JSON.parse(evt.data);
        if (response.funcCode == 0) {
            console.log("发送本地游戏数据失败");
        } else if (response.funcCode == 1) {
            console.log("发送本地游戏数据成功");
        } else {
            console.log("因为其它原因发送失败");
        }
    }
}




// 客户端请求服务器发送云端地游戏进度，funcCode == 9
function download_game_data () {
    let data = {
        'funcCode': 9
    }

    socket.send(JSON.stringify(data))
    // TO BE DELETED check 输出
    console.log('拉取请求已提交')

    // 收取服务器的反馈
    // (1) 如果服务器返回的 funcCode == 0，即错误返回，就发一个警告
    // (2) 如果服务器返回的 funcCode == 1，则解析返回数据中的内容并与本地做对比，云端如果更多就用云端，本地多就提示是否 overwrite localStorage
    socket.onmessage = function (evt) {
        let response = JSON.parse(evt.data);
        if (response.funcCode == 0) {
            console.log("请求拉取游戏进度失败");
        } else if (response.funcCode == 1) {
            console.log("请求拉取云端游戏数据成功");
            let len = response.games.length;
            for (let i = 0; i < len; i++) {
                window.localStorage.setItem(games[i].gameName, games[i].xml)
                console.log(games[i].gameName, games[i].xml)
            }
            console.log("浏览器 localStorage 已填写完成！")
        } else {
            console.log("因为其它原因失败，client funcCode == 9");
        }
    }
}



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



// 在集成到 HTML 之前，这就是测试模块
socket.onopen = function() {
    console.log('服务器连接成功。');
    login("newton", '123456');
}



// 慢点执行 js
document.onreadystatechange = function () {
    // 在 Blockly.Games 的顶部添加一个 DOM
    let TopBar = document.createElement("div");
    TopBar.innerHTML = 'THIS IS UCAS';
    TopBar.style.cssText = 'width:100%;background:rgb(192,192,192);';
    window.document.body.insertBefore(TopBar,window.document.body.firstChild);
}
