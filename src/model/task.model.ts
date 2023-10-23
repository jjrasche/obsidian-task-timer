import { STask } from "obsidian-dataview";
import { Status, StatusIndicator, StatusWord, indicatorToStatus } from "./status";
import { convertSimpleDate, sameDay, simpleDate, simpleDisplayDate, simpleDisplayTime, simpleTime } from "../service/date.service";

export class Task {
	phrase: string;
	originalStatus: string;
	tabs: string = "";
	link?: string;
	status: Status;
	timeTaken?: number;
	etc?: number;
	startTime?: Date;
	path: string;
	line: number;

	constructor(task: Task = {} as Task) {
		this.phrase = task.phrase ?? this.phrase;
		this.originalStatus = task.originalStatus ?? this.originalStatus;
		this.tabs = task.tabs ?? this.tabs;
		this.link = task.link ?? this.link;
		this.status = task.status ?? this.status;
		this.timeTaken = task.timeTaken ?? this.timeTaken;
		this.etc = task.etc ?? this.etc;
		this.startTime = task.startTime ?? this.startTime;
		this.path = task.path ?? this.path;
		this.line = task.line ?? this.line;
	}
	get now() { return new Date().getTime(); }

	get timeSinceActive() {
		const t = Math.round(this.now - (this.startTime?.getTime() ?? 0));
		return !!this.startTime ? Math.round((this.now - this.startTime.getTime()) / (1000*60)) : 0
	}
	get timeEllapsed() { 
		return this.status == Status.Active ? this.timeSinceActive : 0
	}

	get timeLeft() {
		if (!!this.etc) {
			const timeSpent = ((this.timeTaken ?? 0) + this.timeEllapsed);
			return this.etc - timeSpent;
		}
		return 0;
	}

	get overTime() {
		if (!this.etc) return false;
		return this.timeLeft < 0;
	}
	get nearOver() {
		if (!this.etc) return false;
		const percentTimeLeft = this.timeLeft / this.etc;
		return percentTimeLeft < .1;
	}
	
	get displayString() { 
		return `{'phrase':'${this.phrase}', 'originalStatus':'${this.originalStatus}', 'tabs':'${this.tabs}', 'link':'${this.link}', 'status':'${this.status}', 'timeTaken':'${this.timeTaken}', 'etc':'${this.etc}', 'startTime':'${this.startTime}', 'path':'${this.path}', 'line':'${this.line}}'`;
	}

	get readablePhrase() {
		let ret = this.phrase;
		// handle backlink without alias
		ret = ret.replace(/\[\[([^|]*?)\]\]/, "$1");
		// handle backlink with alias: "hello [[#^aa3ab2|other name]]" -> "hello other name"
		ret = ret.replace(/\[\[.*\|/, "").replace(/\]\]/,"")
		// handle link: "hello [link](http://link.com)" -> "hello link"
		ret = ret.replace(/\]\(.*\)/, "").replace("[", "");
		return ret;
	}
}

export const staskToTask = (stask: STask): Task => {
	let task = new Task();
	let text = stask.text.split("\n")[0];
	task.path = stask.path;
	task.tabs = [...Array(stask?.position?.start?.col ?? 0)].reduce((acc) => acc += "\t", "") ?? "";
	task.line = stask.line;
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
	const e = !!task.etc ? " etc:" + task.etc : "";
	const t = !!task.timeTaken ? " t:" + task.timeTaken : "";
	const link = !!task.link ? " " + task.link : "";
	return `${task.tabs}- [${StatusIndicator[task.status]}] ${task.phrase}${d}${s}${e}${t}${link}`;
}
// `A 18:00 (-14) blah`
export const taskToStausBar = (t: Task): string => `${t.phrase} ${t.timeLeft}`;
export const taskToSelect = (t: Task): string => `${StatusWord[t.status?? 0][0]} ${simpleDisplayTime(t.startTime)} (${t.timeLeft}) ${t.phrase}`;

/*
	pullers: used to take metadata out of a string and return the formatted value of that metadata
*/
export const pullStart = (str: string): [string, Date?] => {
	let d, t;
	[str, d]  = pullMetadata(str, /d\:[0-9]{6}/g);
	[str, t]  = pullMetadata(str, /s\:[0-9]{3,4}/g);
	return [str, d ? convertSimpleDate(d, t) : undefined];
}
export const pullEtc = (str: string) => pullMetadataNumber(str, /etc\:[0-9]{1,3}/g)
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
