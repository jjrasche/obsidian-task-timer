import { Status } from "model/status";
import { Task, getReadablePhrase, taskToSelect } from "model/task.model";
import { SuggestModal } from "obsidian";
import { todaysTasks as getTodaysTasks, trackedTasks } from "service/data-view.service";
import { changeTaskStatus, saveSuggestion } from "./service/modify-task.service";
import * as app from 'state/app.state';
import { TaskSuggestion } from "./model/task-suggestion.model";
import { suggestedTasks } from "./service/suggested-task.service";

export class TaskToggleModal extends SuggestModal<Task> {
	commonTasks: TaskSuggestion[];
	todaysTasks: Task[];

	constructor() {
		super(app.get());
		// this.resultContainerEl.parentElement?.prepend(
		// 	this.resultContainerEl.parentElement.createEl("div", { text: "hello bob" })
		// );
		const file = app.get().workspace.getActiveFile();        
        if (!file) throw new Error("no file active");

		const tasks = trackedTasks();
		this.todaysTasks = getTodaysTasks();
		this.commonTasks = suggestedTasks(tasks);
		const fileTasks = tasks.filter(t => t.path == file.path && t.status != Status.Complete);
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
		const todaysTasks = this.todaysTasks.filter((task) => task.phrase.toLowerCase().includes(query.toLowerCase()));
		const commonTasks = this.commonTasks.filter((task) => {
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
			saveSuggestion(task);
			// create task in appropriate place ... need to use mapper to make appropriate move maybe 
		}
	}
}