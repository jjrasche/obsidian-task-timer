import { Status } from "../model/status"
import { Task, taskToLine } from "../model/task.model";
import { Editor, Notice } from "obsidian"
import * as log from './logging.service';
import * as statusBar from './status-bar.service';
import * as file from "./file.service";
import { getTaskByCursor, todaysTasks } from "./data-view.service";
import { TaskSuggestion } from "../model/task-suggestion.model";

export const updateTaskFromEditor = async (editor: Editor, status: Status) => {
    const task = getTaskByCursor(editor);
    await changeTaskStatus(task, status);
}

export const changeTaskStatus = async (task: Task, status: Status) => {
    const originalTask = new Task(task); // for logging
    // do not add the same status as current status
    if (task.status === status){ return; }
    // consider not changing task if the d is not today, enforcing that a new task is created per day

    if (status === Status.Active) {
        task.setStartTime();
        await inactivateAllActiveTasks();
    } else if (task.status === Status.Active) {       // inactivating = any action performed on an already active task
        task.timeTaken = (task.timeTaken ?? 0) + (!!task.startTime ? Math.round((Date.now() - task.startTime.getTime()) / (1000*60)) : 0);
    }
    task.status = status;

    await log.toConsoleAndFile(`task object changed:\n${originalTask.displayString}\n${task.displayString}`);
    await saveTaskLine(task, updateTaskLine);
    statusBar.initialize();
    // consider need to update allTasks or can I trigger data view refresh???
}

export const saveSuggestion = async (suggestion: TaskSuggestion) => {
    const fileName = suggestion.fileToSaveIn();
    const header = suggestion.headerToSaveUnder();
    // assuming original tasks are under header, might want to change behavior later
    if (!!fileName && header) {
        const task = suggestion.convertToTask(fileName);
        const modifier = async (task: Task, lines: string[]): Promise<string[]> => {
            await inactivateAllActiveTasks();
            return addTaskLine(header, task, lines);
        }
        await saveTaskLine(task, modifier);
    } else {
        new Notice(`attempted to save suggestion ${suggestion.phrase} in file ${fileName} under header ${header}`);
    }
}

const updateTaskLine = async (task: Task, lines: string[]): Promise<string[]> => {
    const originalLine = lines[task.line];
    const newLine = taskToLine(task);
    lines[task.line] = newLine
    // mark task and wait for dataview to update its task list to prevent race conditions of altering source prior to task objects updating
    await log.toConsoleAndFile(`updating task in line:${task.line} in file:"${task.path}\n\t${originalLine}\n\t${newLine}"`);
    return lines;
}

export const addTaskLine = async (header: string, task: Task, lines: string[]): Promise<string[]> => {
    const headerLine = lines.findIndex((l: string) => l.contains(header)) + 1;
    const newLine = taskToLine(task);
    await log.toConsoleAndFile(`adding task in line:${headerLine} in file:${task.path}`);
    return [...lines.slice(0, headerLine), newLine, ...lines.slice(headerLine)];
}

export const saveTaskLine = async (task: Task, modifier: (task: Task, lines: string[]) => Promise<string[]>) => {
    let originalContent = await file.read(task.path);
    let lines = originalContent.split("\n");
    lines = await modifier(task, lines);
    const updatedContent = lines.join("\n");
    await file.write(task.path, updatedContent);
}

export const inactivateAllActiveTasks = async () => {
    // find all currently active tasks
    const activeTasks = todaysTasks().filter(t => t.status === Status.Active);
    if (activeTasks.length === 0) return;
    // change each task to inactive
    await log.toConsoleAndFile(`inactivating ${activeTasks.length} tasks:\n${activeTasks.map(t => t.displayString).join("\n")}"`);
    await Promise.all(activeTasks.map(t => changeTaskStatus(t, Status.Inactive)));
}