export class Task {
	timeTaken: number;
	estimateTimeToCompletion: number;
	startTime: Date;
}

export const convertTaskLineToTask = (line: string): Task => {
	return new Task();
}

export const convertTaskToLine = (task: Task): string => {
	return "";
}