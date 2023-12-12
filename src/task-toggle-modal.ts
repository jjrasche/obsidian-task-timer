import { Status } from "model/status";
import { Task, taskToSelect } from "model/task.model";
import { Instruction, SuggestModal } from "obsidian";
import { todaysTasks, trackedTasks } from "service/data-view.service";
import { changeTaskStatus } from "./service/modify-task.service";
import * as app from 'state/app.state';

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
		const etcByday = todaysTasks().reduce((acc, t) => acc + (t.etc ?? 0), 0);
		this.setInstructions([
			{command: "today etc:", purpose: etcByday.toString()},
			{command: "file etc:", purpose: etcByFile.toString()},
			{command: "file time:", purpose: timeByFile.toString()}
		])
	}

	async getSuggestions(query: string): Promise<any[]> {
		const todays = todaysTasks().filter((task) => task.phrase.toLowerCase().includes(query.toLowerCase()));
		return todays;
	}
	
	renderSuggestion(task: Task, el: HTMLElement) {
		el.createEl("div", { text: taskToSelect(task) });
	}

	onChooseSuggestion(task: Task) {
		// consider: navigating to task page when choosing
		changeTaskStatus(task, task.status == Status.Active ? Status.Inactive : Status.Active);
	}
}