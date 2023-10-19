import { Status, StatusWord } from "model/status";
import { Task } from "model/task.model";
import { SuggestModal } from "obsidian";
import { allTasks, managedTasks } from "service/data-view.service";
import { changeTaskStatus } from "./service/modify-task.service";
import { simpleDate, simpleTime } from "./service/date.service";

export class TaskToggleModal extends SuggestModal<Task> {
	async getSuggestions(query: string): Promise<any[]> {
		console.log(allTasks().length)
		console.log(managedTasks().length)
		return managedTasks()
			.filter((task) => task.phrase.toLowerCase().includes(query.toLowerCase()) && task.status != Status.Complete)
	}

	// Renders each suggestion item.
	renderSuggestion(task: Task, el: HTMLElement) {
		el.createEl("div", { text: `(${StatusWord[task.status?? 0]}) ${task.phrase} (${task.timeLeft})` });
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(task: Task) {
		// consider
		changeTaskStatus(task, task.status == Status.Active ? Status.Inactive : Status.Active);
	}
}