import { STask } from "obsidian-dataview";
import { Status, StatusIndicator, indicatorToStatus } from "./status";
import { convertSimpleDate, simpleDate, simpleTime } from "../service/date.service";

export class Task {
	phrase: string;
	originalStatus: string;
	link?: string;
	status: Status;
	timeTaken?: number;
	etc?: number;
	startTime?: Date;
	path: string;
	lineNum: number;

	constructor(task: Task = {} as Task) {
		this.phrase = task.phrase ?? this.phrase;
		this.originalStatus = task.originalStatus ?? this.originalStatus;
		this.link = task.link ?? this.link;
		this.status = task.status ?? this.status;
		this.timeTaken = task.timeTaken ?? this.timeTaken;
		this.etc = task.etc ?? this.etc;
		this.startTime = task.startTime ?? this.startTime;
		this.path = task.path ?? this.path;
		this.lineNum = task.lineNum ?? this.lineNum;
	}

	get timeEllapsed() {
		if (!!this.startTime) {
			return (this.timeTaken ?? 0) + (Date.now() - this.startTime.getTime())
		}
	}

	get timeLeft() {
		if (!!this.etc && !!this.timeEllapsed) {
			return this.etc -  this.timeEllapsed;
		}
	}
}

export const convertTaskLineToTask = (line: string): Task => {
	// todo
	return new Task();
}

export const staskToTask = (stask: STask): Task => {
	let task = new Task();
	let text = stask.text;
	task.path = stask.path;
	// todo: handle indents correctly
	task.lineNum = stask.line;
	[text, task.startTime] = [...pullStart(text)]; 
	[text, task.etc] = [...pullEtc(text)]; 
	[text, task.timeTaken] = [...pullTimeTaken(text)]; 
	[text, task.link] = [...pullLink(text)]; 
	task.phrase = text;
	task.originalStatus = stask.status;
	task.status = indicatorToStatus(stask.status);
	return task;
}
// why is this saving ot of order etc first?
export const taskToLine = (task: Task): string => {
	const d = !!task.startTime ? " d:" + simpleDate(task.startTime) : "";
	const s = !!task.startTime ? " s:" + simpleTime(task.startTime) : "";
	const e = !!task.etc ? " e:" + task.etc : "";
	const t = !!task.timeTaken ? " t:" + task.timeTaken : "";
	const link = !!task.link ? " " + task.link : "";
	return `- [${StatusIndicator[task.status]}] ${task.phrase}${d}${s}${e}${t}${link}`;
}


/*
	pullers: used to take metadata out of a string and return the formatted value of that metadata
*/
export const pullStart = (str: string): [string, Date?] => {
	let d, t;
	[str, d]  = pullMetadata(str, /d\:[0-9]{6}/g);
	[str, t]  = pullMetadata(str, /s\:[0-9]{3,4}/g);
	return [str, d ? convertSimpleDate(d, t) : undefined];
}
export const pullEtc = (str: string) => pullMetadataNumber(str, /e\:[0-9]{1,3}/g)
export const pullTimeTaken = (str: string) => pullMetadataNumber(str, /t\:[0-9]{1,3}/g);
export const pullLink = (str: string) => pullMetadata(str, /\^[a-z0-9]{6}/g, (str) => str);

export const pullMetadataNumber = (str: string, regexp: RegExp): [string, number?] => {
	let n;
	[str, n] = pullMetadata(str, regexp)
	return [str, n ? parseInt(n) : undefined];
};
export const pullMetadata = (str: string, regexp: RegExp, formatRet = (str: string) => str.split(":")[1]): [string, string?] => {
	const array = [...str.matchAll(regexp)];
	if (array.length > 1) {
		throw new Error(`had ${array.length} instances matching`)
	}
	str = str.replace(regexp, "").trim();
	try {
		const ret = formatRet(array[0][0]);
		return [str, ret];
	} catch (e) {
		return [str, undefined]
	}
}
