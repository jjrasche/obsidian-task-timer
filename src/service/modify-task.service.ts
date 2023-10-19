import { Status } from "../model/status"
import { Task, taskToLine } from "../model/task.model";
import { Editor } from "obsidian"
import * as log from './logging.service';
import * as statusBar from './status-bar.service';
import * as file from "./file.service";
import { getTaskByCursor } from "./data-view.service";

const isTask = (line: string): boolean => !!line.match(/^\t*- \[.{1}\]\s/g);

export const updateTaskFromEditor = async (editor: Editor, status: Status) => {
    const task = getTaskByCursor(editor);
    await changeTaskStatus(task, status);
}

export const changeTaskStatus = async (task: Task, status: Status) => {
    // do not add the same status as current status
    if (task.status === status ||
        (task.status === Status.Inactive && status === Status.Complete) ||
        (task.status === Status.Complete && status === Status.Inactive)
    ){
        return;
    }

    if (status === Status.Active) {
        task.startTime = new Date();
    } else {
        task.timeTaken = (task.timeTaken ?? 0) + (!!task.startTime ? Math.round((Date.now() - task.startTime.getTime()) / (1000*60)) : 0);
    }
    task.status = status;

    await saveTaskLine(task);
    statusBar.changeTask(task);
    // consider need to update allTasks or can I trigger data view refresh???
}


const saveTaskLine = async (task: Task) => {
    // going to assume I'm writing to the correct line until I see it being a problem
    let originalContent = await file.read(task.path);
    const lines = originalContent.split("\n")
    const originalLine = lines[task.lineNum];
    const newLine = taskToLine(task);
    lines[task.lineNum] = newLine
    const updatedContent = lines.join("\n");
    await file.write(task.path, updatedContent);
    // mark task and wait for dataview to update its task list to prevent race conditions of altering source prior to task objects updating
    await log.toConsoleAndFile(`updating task in line:${task.lineNum} in file:"${task.path}\n\tfrom:${originalLine}\n\tto:${newLine}"`);
}

export const inactivateAllActiveTasks = async () => { }