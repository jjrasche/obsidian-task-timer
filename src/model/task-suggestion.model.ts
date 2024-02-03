import { simpleDisplayDate } from "../service/date.service";
import { Task } from "./task.model";
import { Status } from "./status";
import { averageNumbersNoOutliers } from "../service/array.service";

const numiHistoryToCheck = 3;

export class TaskSuggestion {
	phrase: string;
	instances: Task[] = [];
	get paths(): string[] { return this.instances.map(t => t.path) }
	get path(): string { return this.paths[0] }
	get pastPaths(): string[] { return this.paths.splice(0, numiHistoryToCheck) }
	get usuallyinDailies(): boolean { return this.pastPaths.reduce((acc, curr) => acc && curr.includes("Dailies"), true) }
	get mostRecentPathsSame(): boolean { return new Set(this.pastPaths).size === 1 }
	get headers(): string[] { return this.instances.map(t => t.header) }
	get etc(): number[] { return this.instances.map(t => t.timeTaken).filter(etc => !!etc) as number[] }

	constructor(task: Task = {} as Task) {
		this.phrase = task.phrase ?? this.phrase;
		// if (phrase )
		this.instances.push(task);
	}

	equals(other: Task): boolean {
		// if (this.usuallyinDailies) {
			return this.phrase === other.phrase && this.headers[0] === other.header;
		// }
		// return this.phrase === other.phrase;
	}

	convertToTask(path: string): Task {
		const task = new Task();
		task.path = path;
		task.phrase = this.usuallyinDailies ? `${this.phrase} (${this.headers[0]})` : this.phrase;
		task.status = Status.Active;
		task.etc = Math.floor(averageNumbersNoOutliers(this.etc.slice(0, 15)));
		task.setStartTime();
		return task;
	}

	fileToSaveIn() {
		if (this.usuallyinDailies) {
			return `resource/Dailies/${simpleDisplayDate(new Date())}.md`;
		} else if (this.mostRecentPathsSame) {
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
