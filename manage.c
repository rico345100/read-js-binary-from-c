#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct {
	unsigned int id;
	unsigned int age;
	unsigned int sex;
	char name[100];
} Employee;

int AppendChar(char *s, size_t size, char c) {
	int len = strlen(s);

	if(len + 1 >= size) {
		return -1;
	}

	s[len] = c;
	s[len + 1] = '\0';
	return 0;
}

void PrintEmployee(Employee* employee) {
	printf("ID: %d\n", employee->id);
	printf("Name: %s\n", employee->name);
	printf("Age: %d\n", employee->age);
	printf("Sex: %d\n", employee->sex);
}

int main(void) {
	FILE *fp;
	
	fp = fopen("./ee69728a-c08b-4630-9a9a-7f273d97e638", "rb");

	if(fp == NULL) {
		printf("Error\n");
		exit(1);
	}

	int i = 0;
	unsigned int genId = 0;

	fread(&genId, 1, 1, fp);
	printf("GenID = %d\n\n", genId);	// Read genId

	int nameLen;
	int eid, eage, esex;
	Employee employee;

	while(!feof(fp) && fread(&eid, 1, 1, fp) > 0) {
		fread(&eage, 1, 1, fp);
		fread(&esex, 1, 1, fp);
		fread(&nameLen, 1, 1, fp);
		
		employee.id = eid;
		employee.age = eage;
		employee.sex = esex;

		// Read name
		char name[100] = "";
		for(int i = 0; i < nameLen; i++) {
			short int c;
			fread(&c, 2, 1, fp);
			c >>= 8;	// By default, DataView of JavaScript write as little-endian, so have to shift half of bits
			AppendChar(name, 100, c);
		}

		strcpy(employee.name, name);

		PrintEmployee(&employee);
		printf("\n");
	}

	fclose(fp);

	return 0;
}