import { Status } from "model/status";
import { Task, getReadablePhrase, orderTasks, taskToSelect } from "model/task.model";
import { Instruction, SuggestModal } from "obsidian";
import { todaysTasks as getTodaysTasks, trackedTasks, uniqueTasksByText } from "service/data-view.service";
import { changeTaskStatus } from "./service/modify-task.service";
import * as app from 'state/app.state';
import { TaskSuggestion } from "./model/task-suggestion.model";

export class TaskToggleModal extends SuggestModal<Task> {

	constructor() {
		super(app.get());
		// this.resultContainerEl.parentElement?.prepend(
		// 	this.resultContainerEl.parentElement.createEl("div", { text: "hello bob" })
		// );
		const file = app.get().workspace.getActiveFile();        
        if (!file) throw new Error("no file active");
		const fileTasks = trackedTasks().filter(t => t.path == file.path && t.status != Status.Complete);
		const etcByFile = fileTasks.reduce((acc, t) => acc + (t.etc ?? 0), 0);
		const timeByFile = fileTasks.reduce((acc, t) => acc + (t.timeSpent ?? 0), 0);
		const etcByday = getTodaysTasks().reduce((acc, t) => acc + (t.etc ?? 0), 0);
		this.setInstructions([
			{command: "today etc:", purpose: etcByday.toString()},
			{command: "file etc:", purpose: etcByFile.toString()},
			{command: "file time:", purpose: timeByFile.toString()}
		])
	}

	async getSuggestions(query: string): Promise<any[]> {
		const todaysTasks = getTodaysTasks().filter((task) => task.phrase.toLowerCase().includes(query.toLowerCase()));
		let commonTasks = uniqueTasksByText()
		commonTasks = commonTasks.filter((task) => {
			const matchesQuery = task.phrase?.toLowerCase()?.startsWith(query.toLowerCase());
			const textNotATaskToday = !todaysTasks.find(t => t.phrase == task.phrase);
			return matchesQuery && textNotATaskToday;
		});
		const mostCommonMatching = commonTasks.slice(0, 5) as any[];
		const firstCompleteIndex = todaysTasks.findIndex(t => t.status === Status.Complete);
		todaysTasks.splice(firstCompleteIndex, 0, ...mostCommonMatching as any);
		return todaysTasks;
	}
	
	renderSuggestion(task: Task | TaskSuggestion, el: HTMLElement) {
		const text = task instanceof Task ? taskToSelect(task) : getReadablePhrase(task.phrase);
		el.createEl("div", { text });
	}

	onChooseSuggestion(task: Task | TaskSuggestion) {
		if (task instanceof Task) {
			// consider: navigating to task page when choosing
			changeTaskStatus(task, task.status == Status.Active ? Status.Inactive : Status.Active);
		} else {
			task.save();
			// create task in appropriate place ... need to use mapper to make appropriate move maybe 
		}
	}
}