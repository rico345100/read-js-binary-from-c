let genId = 0;
const formEl = document.getElementById('form');
const nameEl = formEl.querySelector('#name');
const ageEl = formEl.querySelector('#age');
const maleEl = formEl.querySelector('#male');
const femaleEl = formEl.querySelector('#female');

// Submitting Add new Employee form: Create new employee
form.addEventListener('submit', (ev) => {
	ev.preventDefault();

	if(!nameEl.value) {
		alert('Type name.');
		return nameEl.focus();
	}
	else if(!ageEl.value) {
		alert('Type age.');
		return ageEl.focus();
	}
	else if(!maleEl.checked && !femaleEl.checked) {
		return alert('Select sex.');
	}

	const formData = {
		id: genId++,
		name: nameEl.value,
		age: ageEl.value,
		sex: maleEl.checked ? maleEl.value : femaleEl.value
	};

	createEmployee(formData);

	nameEl.value = '';
	ageEl.value = '';
	maleEl.checked = false;
	femaleEl.checked = false;

	nameEl.focus();
});

const listEl = document.getElementById('list');
const tbody = listEl.getElementsByTagName('tbody')[0];
const employeeTemplate = document.getElementById('employee').innerText;

let employeeList = [];

// void function createEmployee(employee): Create new employee and update list
function createEmployee(employee) {
	employeeList.push(employee);
	updateList();
}

// void function updateList(): Update employee list table
function updateList() {
	tbody.innerHTML = '';

	if(employeeList.length === 0) {
		tbody.innerHTML = '<tr><td colspan="5" style="text-align: center">No Employee</td></tr>';
	}

	for(let i = 0; i < employeeList.length; i++) {
		let employee = employeeList[i];
		tbody.appendChild(createEmployeeElement(employee));
	}
}

// HTMLElement function createEmployeeElement(Object employee): Generate actual HTMLElement for appending from updateList()
function createEmployeeElement(employee) {
	let template = employeeTemplate.replace('<tr>', '').replace('</tr>', '');
	let tr = document.createElement('tr');

	tr.innerHTML = template;

	tr.getElementsByClassName('id')[0].innerText = employee.id;
	tr.getElementsByClassName('name')[0].innerText = employee.name;
	tr.getElementsByClassName('age')[0].innerText = employee.age;
	tr.getElementsByClassName('sex')[0].innerText = employee.sex;
	tr.getElementsByClassName('update')[0].addEventListener('click', () => {
		let newName = prompt('New name', employee.name);
		let newAge = prompt('New age', employee.age);
		let newSex = prompt('New sex', employee.sex).toLowerCase();

		if(!{ male: 1, female: 1 }[newSex]) {
			return alert('Sex must be male or female.');
		}

		for(let i = 0; i < employeeList.length; i++) {
			if(employeeList[i] === employee) {
				employeeList[i].name = newName;
				employeeList[i].age = +newAge;
				employeeList[i].sex = newSex;
				break;
			}
		}

		updateList();
	});
	tr.getElementsByClassName('delete')[0].addEventListener('click', () => {
		for(let i = 0; i < employeeList.length; i++) {
			if(employeeList[i] === employee) {
				employeeList.splice(i, 1);
				break;
			}
		}

		updateList();
	});

	return tr;
}

// Init update
updateList();

const importEl = document.getElementById('import');
const exportEl = document.getElementById('export');
const fileEl = document.getElementById('file');

importEl.addEventListener('click', () => {
	fileEl.click();
});
fileEl.addEventListener('change', () => {
	if(fileEl.files.length > 0) {
		let fileReader = new FileReader();
		fileReader.onloadend = () => {
			let buffer = fileReader.result;
			let dv = new DataView(buffer);

			employeeList = [];

			genId = +dv.getUint8(0);

			let read = 1;
			while(read < buffer.byteLength) {
				// Read Employee data
				let employee = {
					id: dv.getUint8(read),
					age: dv.getUint8(read + 1),
					sex: dv.getUint8(read + 2) === 0 ? 'male' : 'female'
				};

				let nameLen = dv.getUint8(read + 3);
				let str = '';
				let offset = 4;		// id + age + sex + nameLen
				
				for(let i = 0; i < nameLen; i++) {
					let char = dv.getUint16(i * 2 + read + offset);
					str += String.fromCharCode(char);
				}

				employee.name = str;
				employeeList.push(employee);
				read += (offset + (nameLen * Uint16Array.BYTES_PER_ELEMENT));
			}

			updateList();

			alert(`Read ${employeeList.length} employee(s) from file.`);
		};

		fileReader.readAsArrayBuffer(fileEl.files[0]);
	}
});
exportEl.addEventListener('click', () => {
	if(employeeList.length) {
		// Each Object will convert as sequence of bytes as follows:
		// [ id:Uint8Array | age: Uint8Array | sex:Uint8Array | nameLen:Uint8Array | name:Array<Uint16Array> ]
		// Uint8Array id: ID
		// Uint8Array age: Age
		// Uint8Array sex: Sex. Male is 0, female is 1.
		// Uint8Array nameLen: Length of name
		// Array<Uint16Array>: Converted 16bits binary string of name
		// And first 8bit is a generated unique ID
		// So actual data looks like:
		// [ id:Uint8Array | employee:Object | employee:Object | ... ]

		let buffers = [];
		let totalLength = 1;	// For ID

		for(let key in employeeList) {
			let employee = employeeList[key];
			let name = employee.name;
			let nameLen = employee.name.length;

			// So now I have length of binary name.
			// Other data are fixed length, nameLen, id, and sex.
			let buffer = new ArrayBuffer(
				Uint8Array.BYTES_PER_ELEMENT +	// id
				Uint8Array.BYTES_PER_ELEMENT + 	// age
				Uint8Array.BYTES_PER_ELEMENT +	// sex
				Uint8Array.BYTES_PER_ELEMENT +	// nameLen
				nameLen * Uint16Array.BYTES_PER_ELEMENT // name
			);
			let dv = new DataView(buffer);

			dv.setUint8(0, employee.id);
			dv.setUint8(1, employee.age);
			dv.setUint8(2, employee.sex === 'male' ? 0 : 1);
			dv.setUint8(3, nameLen);
			
			// convert string to binary
			const OFFSET = 4;	// 3bytes offset of id, sex, nameLen
			for(let i = 0; i < name.length; i++) {
				dv.setUint16(i * 2 + OFFSET, name.charCodeAt(i));
			}
			
			buffers.push(buffer);
			totalLength += buffer.byteLength;
		}

		let writeBuffer = new ArrayBuffer(totalLength);		// Buffer for actual writes
		let wdv = new DataView(writeBuffer);
		wdv.setUint8(0, genId);

		// now copy all!
		let offset = 1;
		for(let i = 0 ; i < buffers.length; i++) {
			let buffer = buffers[i];
			let dv = new DataView(buffer);
			let bufferLen = buffer.byteLength;

			for(let j = 0; j < bufferLen; j++) {
				wdv.setUint8(offset + j, dv.getUint8(j));
			}

			offset += bufferLen;
		}

		// Convert complete. now time to make download!
		let blob = new Blob([wdv], { type: 'application/octet-stream' });
		let a = document.createElement('a');
		let url = URL.createObjectURL(blob);
		a.href = url;
		a.click();

		// Remove URL after 1s
		setTimeout(() => {
			URL.revokeObjectURL(url);
			a = null;
		}, 1000);
	}
});