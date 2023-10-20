import { Status, StatusWord } from "model/status";
import { Task, taskToSelect } from "model/task.model";
import { SuggestModal } from "obsidian";
import { managedTasks } from "service/data-view.service";
import { changeTaskStatus } from "./service/modify-task.service";

export class TaskToggleModal extends SuggestModal<Task> {
	async getSuggestions(query: string): Promise<any[]> {
		return managedTasks()
			.filter((task) => task.phrase.toLowerCase().includes(query.toLowerCase()) && task.status != Status.Complete)
	}
	
	renderSuggestion(task: Task, el: HTMLElement) {
		el.createEl("div", { text: taskToSelect(task) });
	}

	onChooseSuggestion(task: Task) {
		// consider: navigating to task page when choosing
		changeTaskStatus(task, task.status == Status.Active ? Status.Inactive : Status.Active);
	}
}