import { DataviewApi, getAPI, STask } from "obsidian-dataview";
import * as app from '../state/app.state';
import { orderTasks, staskToTask, Task } from "../model/task.model";
import { Editor } from "obsidian";
import { sameDay } from "./date.service";
import { TaskSuggestion } from "../model/task-suggestion.model";

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

// todo: consider making the is a tracked task qualifier /d:\:[0-9{6}]\s/
export const trackedTasks = (): Task[] => allTasks()
    .filter((t: STask) => /etc\:[0-9]{1,3}/.test(t.text))
    .map((stask: STask) => staskToTask(stask));
export const todaysTasks = (d: Date = new Date()): Task[] => trackedTasks()
    .filter((t: Task) => !! t.startTime && sameDay(d, t.startTime))
    .sort((a, b) => orderTasks(a,b));

export const uniqueTasksByText = (): TaskSuggestion[] => {
    const tasks = trackedTasks();
    return tasks.reduce((acc: TaskSuggestion[], t: Task) => {
        const suggestion = acc.find(a => a.phrase == t.phrase);
        if (!!suggestion) {
            suggestion.instances.push(t);
        } else {
            acc.push(new TaskSuggestion(t));
        }
        return acc;
    }, []).sort((a: TaskSuggestion, b: TaskSuggestion) => {
        if (b.instances.length != a.instances.length) {
            return b.instances.length - a.instances.length;
        } else {
            return b.phrase.localeCompare(a.phrase);
        }
    });
}

export const managedTaskFiles = (): string[] => todaysTasks().map(t => t.path);

export const getTaskByCursor = (editor: Editor): Task => {
    const line = editor.getCursor().line;
    const path = app.get().workspace.getActiveFile()?.path;
    const tasks = allTasks();
    const sTask = tasks.find(stask => stask.path == path && stask.line == line);
    if (!sTask) {
        const fromObsidianPlugin = (app.get() as any).plugins.plugins["dataview"].api.pages().file.tasks;
        throw new Error(`couldn't find dataview task in file ${path} line ${line}`);
    }
    const task = staskToTask(sTask);
    task.etc = task.etc ?? 5;       // todo: make etc default a setting 
    return task;
}

export const getActiveTask = (): Task => todaysTasks()[0];

/*
    when api is initialized, set listeners 
    does the dv api have a listener for changes? A: 
*/