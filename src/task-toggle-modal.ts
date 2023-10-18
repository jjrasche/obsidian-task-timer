import { Status, StatusWord } from "model/status";
import { Task } from "model/task.model";
import { SuggestModal } from "obsidian";
import { allTasks } from "service/data-view.service";
import { changeTaskStatus } from "./service/modify-task.service";

export class TaskToggleModal extends SuggestModal<Task> {
	async getSuggestions(query: string): Promise<any[]> {
		const tasks = allTasks();
		return tasks.filter((task) =>
			task.phrase.toLowerCase().includes(query.toLowerCase())
		);
	}

	// Renders each suggestion item.
	renderSuggestion(task: Task, el: HTMLElement) {
		el.createEl("div", { text: `(${StatusWord[task.status?? 0]}) ${task.phrase} - ${task.timeLeft}` });
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(task: Task) {
		// consider
		changeTaskStatus(task, task.status == Status.Active ? Status.Inactive : Status.Active);
	}
}