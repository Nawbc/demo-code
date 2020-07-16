// const { WinWin, ffi, CPP, L } = require('win-win');

// const { CreateThread, MessageBoxW } = new WinWin().winFns();

// const proc = ffi.Callback('int32', ['void*'], () => {
// 	MessageBoxW(0, L("exmpale"), null, CPP.MB_OK | CPP.MB_ICONEXCLAMATION);
// });

// CreateThread(null, 0, proc, Buffer.alloc(0), 0, Buffer.alloc(0));

const { StructType, ref, CPP } = require('.');

const Struct = StructType(ref);

const MSG = Struct({
	hwnd: CPP.HWND,
	message: CPP.UINT,
	wParam: CPP.WPARAM,
	lParam: CPP.LPARAM,
	time: CPP.DWORD,
	pt: CPP.POINT
});
const msg = new MSG();
console.log(msg.ref().type);