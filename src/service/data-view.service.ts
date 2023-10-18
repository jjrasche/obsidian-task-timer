import { DataviewApi, getAPI, STask } from "obsidian-dataview";
import * as app from 'state/app.state';
import { staskToTask, Task } from "../model/task.model";

let _api: DataviewApi;

export const api = (): DataviewApi => {
    if (!_api) {
        _api = getAPI(app.get()) as DataviewApi;
    }
    return _api;
}

export const ready = (): boolean => !!api() && !!api().pages() && api().pages().length > 0;
// export const allTasks: () => STask[] = () => api().pages().file.tasks as STask[];
export const allTasks: () => Task[] = () => {
    const t = api().pages().file.tasks
        .filter((t: STask) => t.text.contains("etc:"))
        .map((stask: STask) => staskToTask(stask))
    return t;
}