import { DataviewApi, getAPI, STask } from "obsidian-dataview";
import * as app from '../state/app.state';
import { staskToTask, Task } from "../model/task.model";
import { Editor } from "obsidian";
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
        .filter((t: STask) => /etc\:[0-9]{1,3}/.test(t.text))
        .map((stask: STask) => staskToTask(stask))
        .sort((a: Task, b: Task) => {
            if (b.status != a.status) {
                return b.status = a.status;
            }
            return (b.startTime?? new Date("2000-1-1")).getTime() - (a.startTime?? new Date("2000-1-1")).getTime()
        });
}

export const getTaskByCursor = (editor: Editor): Task => {
    const line = editor.getCursor().line;
    const path = app.get().workspace.getActiveFile()?.path;
    const task = managedTasks().find(stask => stask.path == path && stask.lineNum == line);
    if (!task) {
        throw new Error(`couldn't find dataview task in file ${path} line ${line}`);
    }
    return task;
}

export const getActiveTask = (): Task => {
    debugger;
    return managedTasks()[0]
}
