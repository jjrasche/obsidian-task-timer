import { StatusWord } from "model/status";
import { Task } from "model/task.model";
import { SuggestModal } from "obsidian";
import { updateTaskFromClick } from "service/modify-task.service";

export class TaskToggleModal extends SuggestModal<Task> {
	async getSuggestions(query: string): Promise<any[]> {
		// todo: get all tasks with metadata
		const tasks: any[] = [];
		return tasks.filter((task) =>
			task.text.toLowerCase().includes(query.toLowerCase())
		);
	}

	// Renders each suggestion item.
	renderSuggestion(task: Task, el: HTMLElement) {
		el.createEl("div", { text: `${task.text} (${StatusWord[task.status?? 2]}) - ${task.timeSpent}` });
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(task: Task, evt: MouseEvent | KeyboardEvent) {
		updateTaskFromClick(task.id);
	}
}