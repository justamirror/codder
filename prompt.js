const cp = require('child_process');
const fs = require('fs');
const platform = process.platform;

function prompt(msg, options) {
	let mask = typeof options === 'string' ? options : options?.mask;
	let ctrlc = options?.sigint ?? true;
	process.stdout.write('\u001b[s' + msg);

	if (platform === 'win32' && mask == null && mask !== '') {
		cmd = 'cmd';
		args = [
			'/V:ON',
			'/C',
			'set /p response= && echo !response!'
		];
		
		const options = {
			stdio: [ 'inherit', 'pipe', 'inherit' ],
			shell: false,
		};

		return String(cp.spawnSync(cmd, args, options).stdout).slice(0, -1);
	} else {
		let stdin = platform === 'win32' ? process.stdin.fd : fs.openSync('/dev/tty', 'rs');
		
		let result = '';
		let buffer = Buffer.alloc(3);
		let index = 0;
		let sIndex = 1;

		let raw = process.stdin.isRaw;
		if (!raw) process.stdin.setRawMode && process.stdin.setRawMode(true);
		
		while (true) {
			let read = fs.readSync(stdin, buffer, 0, 3);
			if (read > 1) {
				switch (buffer.toString()) {
					case '\u001b[D':
						if (index > 1) {
							index = --sIndex;
							process.stdout.write('\u001b[D');
						}
						break;
					case '\u001b[C':
						if (index < result.length+1) {
							index = ++sIndex === 0 ? 1 : sIndex;
							process.stdout.write('\u001b[C');
						}
						break;
					default:
						buffer = Buffer.alloc(3);
				}
				continue;
			}
			let char = buffer[read-1];
			if (char === 10 || char == 13) break;
			if (char === 3) {
				if (ctrlc) process.exit(0);
				break;
			}
			if (char === 127 || char === 8) { // backspace
				if (index < 1) continue;
				result = result.slice(0, index-2) + result.slice(index-1);
				sIndex = --index === result.length ? index-1 : index;
				process.stdout.write('\u001b[2D');
			} else {
				result = result.slice(0, index) + String.fromCharCode(char) + result.slice(index);
				buffer = Buffer.alloc(3);
				index = ++sIndex;
			}

			process.stdout.write(`\u001b[u\u001b[0G\u001b[K${msg}${(mask != null && mask !== '') ? mask.repeat(result.length) : result}\u001b[${msg.length+sIndex}G`);
		}

		fs.closeSync(stdin);
		process.stdin.setRawMode && process.stdin.setRawMode(raw);
		console.log();
		return result;
	}
}

module.exports = prompt;