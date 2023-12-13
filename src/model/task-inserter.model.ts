import { Task } from "./task.model";

export class TaskInserter {
	phrase: string;
	instances = 1;
	path: string;
	header: string;

	constructor(task: Task = {} as Task) {
		this.phrase = task.phrase ?? this.phrase;
		this.path = task.path ?? this.path;
		this.header = task.header ?? this.header;
	}
}
