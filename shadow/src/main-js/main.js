const { app, BrowserWindow } = require('electron');
const { resolve } = require('path');
const { ShadowWindowAction, ShadowMouse, MouseEvents, MouseMove, MouseClickSpecifiedCount, MouseUp, bufferCastInt32 } = require('shadow-addon');

const Fibers = require('fibers');

app.commandLine.appendSwitch('disable-site-isolation-trials');

app.allowRendererProcessReuse = true;

if (require('electron-squirrel-startup')) { app.quit(); }

const mouseWorkerPath = resolve(app.getAppPath(), './mouse_worker.js');
const windowPath = resolve(__dirname, '../../dist/shadow.html');

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		frame: false,
		transparent: true,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false,
			webviewTag: true,
			sandbox: false
		}
	});

	mainWindow.maximize();
	mainWindow.loadURL(windowPath);

	const hwnd = bufferCastInt32(mainWindow.getNativeWindowHandle());

	const inc = Fibers(function (start) {
		console.log(start);
		const shadowWindow = new ShadowWindowAction(mainWindow.getNativeWindowHandle());

		shadowWindow.embeddedIntoDesktop();

		const shadowMouse = new ShadowMouse(shadowWindow, { autoCreateThread: false });

		shadowMouse.mount((mouse) => {

			mouse.on(MouseEvents.clickSpecifiedCount, (event) => {
				const { window } = event;
				if (window.isUnderDesktop) {
					shadowWindow.takeOutFromDesktop();
					mouse.setInteractive(false);
				}
			});

			mouse.on(MouseEvents.move, (event) => {
				const { window } = event;
				if (event.x > window.screen.width - 5 && event.y < 20 && !window.isUnderDesktop) {
					window.embeddedIntoDesktop();
				}
			});
		});
	});
	inc.run(hwnd);

};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

// class MainApp {
// 	private _initApp = () => {
// 		console.log(1);
// 	}

// }