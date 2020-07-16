import { app, BrowserWindow } from 'electron';
import { resolve } from 'path';
import { ShadowWindowAction, ShadowMouse, MouseEvents, MouseMove, MouseClickSpecifiedCount, MouseUp, bufferCastInt32 } from 'shadow-addon';

import { default as Fibers } from 'fibers';
app.commandLine.appendSwitch('disable-site-isolation-trials');

app.allowRendererProcessReuse = true;

if (require('electron-squirrel-startup')) { app.quit(); }

const mouseWorkerPath = resolve(app.getAppPath(), './mouse_worker.js');
const windowPath = resolve(app.getAppPath(), './shadow.html');

const createWindow = (): void => {
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
	console.log(process.versions);

	const shadowWindow = new ShadowWindowAction(mainWindow.getNativeWindowHandle());

	shadowWindow.embeddedIntoDesktop();

	const shadowMouse = new ShadowMouse(shadowWindow, { autoCreateThread: false });

	shadowMouse.mount((mouse: ShadowMouse) => {

		mouse.on(MouseEvents.clickSpecifiedCount, (event: MouseClickSpecifiedCount) => {
			const { window } = event;
			if (window.isUnderDesktop) {
				shadowWindow.takeOutFromDesktop();
				mouse.setInteractive(false);
			}
		});

		mouse.on(MouseEvents.move, (event: MouseMove) => {
			const { window } = event;
			if (event.x > window.screen.width - 5 && event.y < 20 && !window.isUnderDesktop) {
				window.embeddedIntoDesktop();
			}
		});
	});

	// const inc = Fibers(function (start: any) {
	// 	console.log(start);
	// });
	// inc.run(hwnd);

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