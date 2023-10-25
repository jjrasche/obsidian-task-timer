import { Status, StatusWord } from "model/status";
import { Task, orderTasks, taskToSelect } from "model/task.model";
import { SuggestModal } from "obsidian";
import { todaysTasks } from "service/data-view.service";
import { changeTaskStatus } from "./service/modify-task.service";

export class TaskToggleModal extends SuggestModal<Task> {
	async getSuggestions(query: string): Promise<any[]> {
		return todaysTasks()
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