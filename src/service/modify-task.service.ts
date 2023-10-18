import { Status, StatusIndicator } from "model/status"
import { Task, convertTaskLineToTask } from "model/task.model";
import { Editor, EditorPosition } from "obsidian"
import * as app from 'state/app.state';
import * as statusBar from 'service/status-bar.service';
import * as log from 'service/logging.service';
import * as file from "service/file.service";

const isTask = (line: string): boolean => !!line.match(/^\t*- \[.{1}\]\s/g);

export const updateTaskFromEditor = async (editor: Editor, status: Status) => {
    const taskLine = getTaskLineByCursor(editor);
    const task = convertTaskLineToTask(taskLine);
    await changeTaskStatus(task, status);
}
 

export const changeTaskStatus = async (task: Task, status: Status) => {
    // do not add the same status as current status
    if (task.status === status) {
        return;
    }
    
    task.status = status;
    await saveTaskLine();
    // statusBar.modify(task);
}

const getTaskLineByCursor = (editor: Editor): string => {
    const cursor = editor.getCursor();
    if (!cursor) throw new Error("didn't find an acitve cursor");
    const line = editor.getLine(cursor.line);
    if (!line) throw new Error("no active cursor");
    if (!isTask(line)) throw new Error("cursor not on line that is NOT a task");
    return line;
}


const saveTaskLine = async () => {
    // let originalContent = await file.read(task.path);
    // const lines = originalContent.split("\n")
    // const originalLine = lines[task.line];
    // const newLine = task.toString();
    // lines[task.line] = newLine
    // const updatedContent = lines.join("\n");
    // await file.write(task.path, updatedContent);
    // // mark task and wait for dataview to update its task list to prevent race conditions of altering source prior to task objects updating
    // task.dirty = false;
    // task.saved = true;
    // sourceUpdateWaits.push(wait.until(() => dv.taskInDv(task.id), () => {}, 500));
    // await log.toConsoleAndFile(`updated task source: ${task.toLog()}\tfrom:'${originalLine}'\tupdated:${newLine}`);
}

export const inactivateAllActiveTasks = async () => { }