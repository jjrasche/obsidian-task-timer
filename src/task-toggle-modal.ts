import { StatusWord } from "model/status";
import { Task } from "model/task.model";
import { SuggestModal } from "obsidian";
import { allTasks } from "service/data-view.service";

export class TaskToggleModal extends SuggestModal<Task> {
	async getSuggestions(query: string): Promise<any[]> {
		// todo: get all tasks with metadata
		const tasks: any[] = allTasks();
		return tasks.filter((task) =>
			task.text.toLowerCase().includes(query.toLowerCase())
		);
	}

	// Renders each suggestion item.
	renderSuggestion(task: Task, el: HTMLElement) {
		el.createEl("div", { text: `(${StatusWord[task.status?? 0]}) ${task.name} - ${task.timeLeft}` });
	}

	// Perform action on the selected suggestion.
	onChooseSuggestion(task: Task, evt: MouseEvent | KeyboardEvent) {
		// updateTaskFromClick(task.id);
	}
}