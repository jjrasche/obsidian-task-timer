import { STask } from "obsidian-dataview";
import { Status } from "./status";

export class Task {
	name: string; 
	status: Status;
	timeTaken: number;
	estimateTimeToCompletion: number;
	startTime: Date;
	file: string;
	lineNum: number;


	get timeEllapsed() {
		return (this.timeTaken ?? 0) + (Date.now() - this.startTime.getTime())
	}

	get timeLeft() {
		return this.estimateTimeToCompletion -  this.timeEllapsed;
	}
}

export const convertTaskLineToTask = (line: string): Task => {
	return new Task();
}

export const convertStaskToTask = (stask: STask): Task => {
	let task = new Task();
	// task.name = 
	return task;
}

export const convertTaskToLine = (task: Task): string => {
	return "";
}
