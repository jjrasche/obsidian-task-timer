import { Status, StatusIndicator } from "model/status"
import { Task } from "model/task.model";
import { Editor, EditorPosition } from "obsidian"
import * as app from 'state/app.state';
import * as statusBar from 'service/status-bar.service';
import * as log from 'service/logging.service';

const isTask = (line: string): boolean => !!line.match(/^\t*- \[.{1}\]\s/g);

export const updateTaskFromEditor = async (editor: Editor, status: Status) => {
    const cursor = editor.getCursor();
    if (!cursor) return; // didn't find an acitve cursor 
    const line = editor.getLine(cursor.line);
    if (!line) return; // no active cursor
    if (!isTask(line)) return; // line is not a task
    await changeTaskStatus(task, status);
}
 

export const changeTaskStatus = async (task: Task, status: Status) => {
    // do not add the same status as current status
    if (task.status === StatusIndicator[status]) {
        return;
    }
    
    await task.setStatus(status);
    await tasks.persist();
    statusBar.modify(task);
}

export const inactivateAllActiveTasks = async () => { }