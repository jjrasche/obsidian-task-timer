import { Status } from "../model/status"
import { Task, taskToLine } from "../model/task.model";
import { Editor } from "obsidian"
import * as log from './logging.service';
import * as statusBar from './status-bar.service';
import * as file from "./file.service";
import { getTaskByCursor, todaysTasks } from "./data-view.service";

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
        task.startTime = new Date();
        await inactivateAllActiveTasks();
    } else if (task.status === Status.Active) {       // inactivating = any action performed on an already active task
        task.timeTaken = (task.timeTaken ?? 0) + (!!task.startTime ? Math.round((Date.now() - task.startTime.getTime()) / (1000*60)) : 0);
    }
    task.status = status;

    await log.toConsoleAndFile(`task object changed:\n${originalTask.displayString}\n${task.displayString}`);
    await saveTaskLine(task);
    statusBar.initialize();
    // consider need to update allTasks or can I trigger data view refresh???
}


const saveTaskLine = async (task: Task) => {
    // going to assume I'm writing to the correct line until I see it being a problem
    let originalContent = await file.read(task.path);
    const lines = originalContent.split("\n")
    const originalLine = lines[task.line];
    const newLine = taskToLine(task);
    lines[task.line] = newLine
    const updatedContent = lines.join("\n");
    await file.write(task.path, updatedContent);
    // mark task and wait for dataview to update its task list to prevent race conditions of altering source prior to task objects updating
    await log.toConsoleAndFile(`updating task in line:${task.line} in file:"${task.path}\n\t${originalLine}\n\t${newLine}"`);
}

export const inactivateAllActiveTasks = async () => {
    // find all currently active tasks
    const activeTasks = todaysTasks().filter(t => t.status === Status.Active);
    if (activeTasks.length === 0) return;
    // change each task to inactive
    await log.toConsoleAndFile(`inactivating ${activeTasks.length} tasks:\n${activeTasks.map(t => t.displayString).join("\n")}"`);
    await Promise.all(activeTasks.map(t => changeTaskStatus(t, Status.Inactive)));
}