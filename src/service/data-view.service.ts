import { DataviewApi, getAPI, STask } from "obsidian-dataview";
import * as app from '../state/app.state';
import { staskToTask, Task } from "../model/task.model";
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

export const ready = (): boolean => !!api() && !!api().pages() && api().pages().length > 0;
export const allTasks: () => STask[] = () => api().pages().file.tasks as STask[];
export const managedTasks: () => Task[] = () => {
    return allTasks()
        .filter((t: STask) => /etc\:[0-9]{1,3}/.test(t.text))                       // filter out tasks without etc prior to conversion
        .map((stask: STask) => staskToTask(stask))
        .filter((t: Task) => t.status != Status.Complete)                           // not managing complete tasks
        .filter((t: Task) => !! t.startTime && sameDay(new Date(), t.startTime))    // same day as today
        .sort((a: Task, b: Task) => {
            if (b.status != a.status) {
                return b.status = a.status;
            }
            return (b.startTime?? new Date("2000-1-1")).getTime() - (a.startTime?? new Date("2000-1-1")).getTime()
        });
}
export const managedTaskFiles = (): string[] => managedTasks().map(t => t.path);

export const getTaskByCursor = (editor: Editor): Task => {
    const line = editor.getCursor().line;
    const path = app.get().workspace.getActiveFile()?.path;
    const stask = allTasks().find(stask => stask.path == path && stask.line == line);
    const task = staskToTask(stask);
    if (!task) {
        throw new Error(`couldn't find dataview task in file ${path} line ${line}`);
    }
    task.etc = task.etc ?? 5;       // default to 5, consider this would need to be considered and modified
    return task;
}

export const getActiveTask = (): Task => managedTasks()[0];

/*
    when api is initialized, set listeners 
    does the dv api have a listener for changes? A: 
*/