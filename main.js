var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var Menu = require('menu');
var MenuItem = require('menu-item');
var Tray = require('tray');


var SockJS = require('sockjs-client');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window objects, if you don't, the windows
// will be closed automatically when the JavaScript objects are garbage
// collected.

var windows = {};
var latest_callers = [];

var appIcon = null;
var contextMenu = null;
var errorSleepTime = 500;

app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform != 'darwin') {
  //   app.quit();
  // }
});


app.on('ready', function() {


	appIcon = new Tray('logo_red.png');
	appIcon.setToolTip('Caller Logs.');
	contextMenu = Menu.buildFromTemplate([
		{ label: 'Settings', type: 'normal'},
	]);
	appIcon.setContextMenu(contextMenu)
	make_connection()

	// sock.close();
});

var make_connection = function()
{
	var sock = new SockJS('http://192.168.0.106:8889/chat');

	sock.onopen = function() {
		console.log('connection to server opened');
		errorSleepTime = 500;
		appIcon.setImage('logo_green.png');
	};

	sock.onmessage = function(e) {
		console.log('message', e.data);
		new_caller(e.data);
	};

	sock.onclose = function() {
		appIcon.setImage('logo_red.png');

		if (errorSleepTime < 8000)
		{
			errorSleepTime *= 2;
		}
		console.log("Connection error; sleeping for", errorSleepTime, "ms");
		setTimeout(make_connection, errorSleepTime);
	};
}

var show_call_window = function(call_info)
{
	var phone_number = call_info['callerid'];
	// create a window or bring it to the top if it does not already exist when
	// a call comes in
	if ( windows.hasOwnProperty(phone_number))
	{
		windows[phone_number].focus();
	}
	else
	{
		var newWindow = new BrowserWindow({width: 800, height: 600});
		windows[phone_number] = newWindow;


		// and load the index.html of the app.
		newWindow.loadUrl('file://' + __dirname + '/index.html');


		newWindow.webContents.on('did-finish-load', function() {
			newWindow.webContents.send('phone', JSON.stringify(call_info));
		});

		// Open the DevTools.
		//newWindow.openDevTools();

		// Emitted when the window is closed.
		newWindow.on('closed', function() {
			// Dereference the window object, usually you would store windows
			// in an array if your app supports multi windows, this is the time
			// when you should delete the corresponding element.
			newWindow = null;
			delete(windows[phone_number]);
		});
	}
}

var new_caller = function(call_info_json)
{
	var call_info = JSON.parse(call_info_json);
	var phone_number = call_info['callerid']
	// add the phone number to the menu if it is not already there
	if (latest_callers.indexOf(phone_number) < 0)
	{
		latest_callers.push(phone_number);
		var caller_menu_item = new MenuItem({ label: phone_number,
			type: 'normal',
			click: function(caller_menu_item){
				// FIXME: this will show old call info
				show_call_window(call_info);
			}
		});
		contextMenu.insert(0, caller_menu_item)
		appIcon.setContextMenu(contextMenu);
		delete(caller_menu_item);
	}
	else
	{
		// TODO: move it to the top if it is
	}

	show_call_window(call_info);
}
