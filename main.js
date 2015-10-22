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

	var sock = new SockJS('http://192.168.0.106:8889/chat');

	sock.onopen = function() {
		console.log('connection to server opened');
		appIcon.setImage('logo_green.png');
	};

	sock.onmessage = function(e) {
		console.log('message', e.data);
		new_caller(e.data);
	};
	sock.onclose = function() {
		console.log('connection to server closed');

		appIcon.setImage('logo_red.png');
	};

	// sock.close();
});

var show_call_window = function(phone_number)
{
	// create a window or bring it to the top if it does not already exist when
	// a call comes in
	if ( windows.hasOwnProperty(phone_number))
	{
		windows[phone_number].focus();
		// TODO: needs to also bring the window to the current virtual desktop
	}
	else
	{
		var newWindow = new BrowserWindow({width: 800, height: 600});
		windows[phone_number] = newWindow;


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
			delete(windows[phone_number]);
		});
	}
}
var new_caller = function(phone_number)
{
	// add the phone number to the menu if it is not already there
	if (latest_callers.indexOf(phone_number) < 0)
	{
		latest_callers.push(phone_number);
		var caller_menu_item = new MenuItem({ label: phone_number,
			type: 'normal',
			click: function(caller_menu_item){
				show_call_window(caller_menu_item.label);
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

	show_call_window(phone_number);
}
