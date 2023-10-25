import { DataviewApi, getAPI, STask } from "obsidian-dataview";
import * as app from '../state/app.state';
import { orderTasks, staskToTask, Task } from "../model/task.model";
import { Editor } from "obsidian";
import { sameDay } from "./date.service";
import { Status } from "../model/status";

let _api: DataviewApi;

export const api = (): DataviewApi => {
    if (!_api) {
        _api = getAPI(app.get()) as DataviewApi;
    }
    return _api;
}

// todo: cash task data and pull only when files with etc tasks have changed... adds overhead, but "getTaskByCursor" is taking 100ms!

export const ready = (): boolean => !!api() && !!api().pages() && api().pages().length > 0;
export const allTasks = (): STask[] => [...api().pages().file.tasks]

export const trackedTassks = (): Task[] => allTasks()
    .filter((t: STask) => /etc\:[0-9]{1,3}/.test(t.text))
    .map((stask: STask) => staskToTask(stask));
export const todaysTasks = (): Task[] => trackedTassks().filter((t: Task) => !! t.startTime && sameDay(new Date(), t.startTime));

export const toggleTasks = (): Task[] => {
    return todaysTasks()
        .filter((t: Task) => t.status != Status.Complete)                           // not managing complete tasks
        .sort((a, b) => orderTasks(a,b));
}

export const managedTaskFiles = (): string[] => todaysTasks().map(t => t.path);

export const getTaskByCursor = (editor: Editor): Task => {
    const line = editor.getCursor().line;
    const path = app.get().workspace.getActiveFile()?.path;
    const sTask = allTasks().find(stask => stask.path == path && stask.line == line);
    const task = staskToTask(sTask);
    if (!task) {
        throw new Error(`couldn't find dataview task in file ${path} line ${line}`);
    }
    task.etc = task.etc ?? 5;       // default to 5, consider this would need to be considered and modified
    return task;
}

export const getActiveTask = (): Task => todaysTasks()[0];

/*
    when api is initialized, set listeners 
    does the dv api have a listener for changes? A: 
*/