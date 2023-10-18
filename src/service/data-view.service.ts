import { DataviewApi, getAPI, STask } from "obsidian-dataview";
import * as app from 'state/app.state';

let _api: DataviewApi;

export const api = (): DataviewApi => {
    if (!_api) {
        _api = getAPI(app.get()) as DataviewApi;
    }
    return _api;
}

export const ready = (): boolean => !!api() && !!api().pages() && api().pages().length > 0;
// export const allTasks: () => STask[] = () => api().pages().file.tasks as STask[];
export const allTasks: () => STask[] = () => {
   const t = api().pages().file.tasks.filter((t: STask) => t.text.contains("etc:"))
    return t;
}