$(function() {

	// 加载设置
	var defaultConfig = {color: 'white'}; // 默认配置
	chrome.storage.sync.get(defaultConfig, function(items) {
		document.body.style.backgroundColor = items.color;
	});

	// 初始化国际化
	$('#test_i18n').html(chrome.i18n.getMessage("helloWorld"));


});

// 打开后台页
$('#open_background').click(e => {
	window.open(chrome.extension.getURL('background.html'));
});

// 调用后台JS
$('#invoke_background_js').click(e => {
	var bg = chrome.extension.getBackgroundPage();
	bg.testBackground();
});

// 注册
$('#register_js').click(e => {
	var username = prompt('请输入用户名');
	var password = prompt('请输入密码');
	register(username, password);
});

// 登陆
$('#login_js').click(e => {
	var username = prompt('请输入用户名');
	var password = prompt('请输入密码');
	login(username, password);
});

// 下载数据
$('#download_js').click(e => {
	download_game_data();
});

// 上传数据
$('#upload_js').click(e => {
	upload_game_data();
});

// 获取后台页标题
$('#get_background_title').click(e => {
	var bg = chrome.extension.getBackgroundPage();
	alert(bg.document.title);
});

// 设置后台页标题
$('#set_background_title').click(e => {
	var title = prompt('请输入background的新标题：', '这是新标题');
	var bg = chrome.extension.getBackgroundPage();
	bg.document.title = title;
	alert('修改成功！');
});

// 自定义窗体大小
$('#custom_window_size').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		var startLeft = 10;
		chrome.windows.update(currentWindow.id, 
		{
			left: startLeft * 10,
			top: 100,
			width: 800,
			height: 600
		});
		var inteval = setInterval(() => {
			if(startLeft >= 40) clearInterval(inteval);
			chrome.windows.update(currentWindow.id, {left: (++startLeft) * 10});
		}, 50);
	});
});

// 最大化窗口
$('#max_current_window').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		// state: 可选 'minimized', 'maximized' and 'fullscreen' 
		chrome.windows.update(currentWindow.id, {state: 'maximized'});
	});
});


// 最小化窗口
$('#min_current_window').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		// state: 可选 'minimized', 'maximized' and 'fullscreen' 
		chrome.windows.update(currentWindow.id, {state: 'minimized'});
	});
});

// 打开新窗口
$('#open_new_window').click(() => {
	chrome.windows.create({state: 'maximized'});
});

// 关闭全部
$('#close_current_window').click(() => {
	chrome.windows.getCurrent({}, (currentWindow) => {
		chrome.windows.remove(currentWindow.id);
	});
});

// 新标签打开网页
$('#open_url_new_tab').click(() => {
	chrome.tabs.create({url: 'https://www.baidu.com'});
});

// 当前标签打开网页
$('#open_url_current_tab').click(() => {
	getCurrentTabId(tabId => {
		chrome.tabs.update(tabId, {url: 'http://www.so.com'});
	});
});

// 获取当前标签ID
$('#get_current_tab_id').click(() => {
	getCurrentTabId(tabId => {
		alert('当前标签ID：' + tabId);
	});
});

// 高亮tab
$('#highlight_tab').click(() => {
	chrome.tabs.highlight({tabs: 0});
});

// popup 主动发消息给 content-script
$('#send_message_to_content_script').click(() => {
	sendMessageToContentScript('你好，我是popup！', (response) => {
		if(response) alert('收到来自content-script的回复：'+response);
	});
});

// 监听来自 content-script 的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	console.log('收到来自content-script的消息：');
	console.log(request, sender, sendResponse);
	sendResponse('我是popup，我已收到你的消息：' + JSON.stringify(request));
});

// popup 与 content-script建立长连接
$('#connect_to_content_script').click(() => {
	getCurrentTabId((tabId) => {
		var port = chrome.tabs.connect(tabId, {name: 'test-connect'});
		port.postMessage({question: '你是谁啊？'});
		port.onMessage.addListener(function(msg) {
			alert('收到长连接消息：'+msg.answer);
			if(msg.answer && msg.answer.startsWith('我是'))
			{
				port.postMessage({question: '哦，原来是你啊！'});
			}
		});
	});
});

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 这2个获取当前选项卡id的方法大部分时候效果都一致，只有少部分时候会不一样
function getCurrentTabId2()
{
	chrome.windows.getCurrent(function(currentWindow)
	{
		chrome.tabs.query({active: true, windowId: currentWindow.id}, function(tabs)
		{
			if(callback) callback(tabs.length ? tabs[0].id: null);
		});
	});
}

// 向content-script主动发送消息
function sendMessageToContentScript(message, callback)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.sendMessage(tabId, message, function(response)
		{
			if(callback) callback(response);
		});
	});
}
