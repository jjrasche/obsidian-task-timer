import { TaskSuggestion } from "../model/task-suggestion.model";
import { Task } from "../model/task.model";

export const suggestedTasks = (tasks: Task[]): TaskSuggestion[] => {
    const uniqueTasks = tasks.reduce((acc: TaskSuggestion[], t: Task) => {
        const suggestion = acc.find(a => a.equals(t));
        if (!!suggestion) {
            suggestion.instances.push(t);
        } else {
            acc.push(new TaskSuggestion(t));
        }
        return acc;
    }, [])
    
    return uniqueTasks.sort((a: TaskSuggestion, b: TaskSuggestion) => {
        if (b.instances.length != a.instances.length) {
            return b.instances.length - a.instances.length;
        } else {
            return a.phrase.localeCompare(b.phrase);
        }
    });
}
