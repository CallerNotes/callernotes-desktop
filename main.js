var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var SockJS = require('sockjs-client');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window objects, if you don't, the windows
// will be closed automatically when the JavaScript objects are garbage
// collected.
var windows = {};

app.on('ready', function() {
	var sock = new SockJS('http://192.168.0.106:8889/chat');
	sock.onopen = function() {
		console.log('connection to server opened');
	};
	sock.onmessage = function(e) {
		console.log('message', e.data);

		if ( windows.hasOwnProperty(e.data))
		{
			windows[e.data].focus();
		}
		else
		{
			var newWindow = new BrowserWindow({width: 800, height: 600});
			windows[e.data] = newWindow;


			// and load the index.html of the app.
			//newWindow.loadUrl('');

			// Open the DevTools.
			//newWindow.openDevTools();

			// Emitted when the window is closed.
			newWindow.on('closed', function() {
				// Dereference the window object, usually you would store windows
				// in an array if your app supports multi windows, this is the time
				// when you should delete the corresponding element.
				newWindow = null;
				delete(windows[e.data]);
			});
		}
	};
	sock.onclose = function() {
		console.log('connection to server closed');
	};

	// sock.close();
});
