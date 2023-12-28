import { Notice } from "obsidian";
import { simpleDisplayDate } from "../service/date.service";
import { Task } from "./task.model";
import { Status } from "./status";
import { addTaskLine, inactivateAllActiveTasks, saveTaskLine } from "../service/modify-task.service";
import { averageNumbersNoOutliers } from "../service/array.service";

const numiHistoryToCheck = 3;

export class TaskSuggestion {
	phrase: string;
	instances: Task[] = [];
	get paths(): string[] { return this.instances.map(t => t.path) }
	get path(): string { return this.paths[0] }
	get headers(): string[] { return this.instances.map(t => t.header) }
	get etc(): number[] { return this.instances.map(t => t.timeTaken).filter(etc => !!etc) as number[] }

	constructor(task: Task = {} as Task) {
		this.phrase = task.phrase ?? this.phrase;
		this.instances.push(task);
	}


	async save() {
		const fileName = this.fileToSaveIn();
		const header = this.headerToSaveUnder();
		// assuming original tasks are under header, might want to change behavior later
		if (!!fileName && header) {
			const task = this.convertToTask(fileName);
			const modifier = async (task: Task, lines: string[]): Promise<string[]> => {
				await inactivateAllActiveTasks();
				return addTaskLine(header, task, lines);
			}
			await saveTaskLine(task, modifier);
		} else {
			new Notice(`attempted to save suggestion ${this.phrase} in file ${fileName} under header ${header}`);
		}
	}

	convertToTask(path: string): Task {
		const task = new Task();
		task.path = path;
		task.phrase = this.phrase;
		task.status = Status.Active;
		task.etc = Math.floor(averageNumbersNoOutliers(this.etc.slice(0, 15)));
		task.setStartTime();
		return task;
	}

	fileToSaveIn() {
		const pastPaths = this.paths.splice(0, numiHistoryToCheck)
		const usuallyInDailies = pastPaths.reduce((acc, curr) => acc && curr.contains("Dailies"), true);
		if (usuallyInDailies) {
			return `resource/Dailies/${simpleDisplayDate(new Date())}.md`;
		} else if (new Set(this.paths.splice(0, numiHistoryToCheck)).size === 1) {
			return this.paths[0];
		}
	}

	headerToSaveUnder() {
		const pastHeaders = this.headers.splice(0, numiHistoryToCheck);
		const consistentlyInHeader = pastHeaders.reduce((acc, curr) => acc && curr === pastHeaders[0] , true);
		if (consistentlyInHeader) {
			return pastHeaders[0];
		}
	}
}
