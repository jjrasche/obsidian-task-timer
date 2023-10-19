import { Task, taskToStausBar } from "../model/task.model";
import { getActiveTask } from "./data-view.service";

let _statusBar: HTMLElement;
let _intervalID: NodeJS.Timer;

export const set = (statusBar: HTMLElement) => _statusBar = statusBar;
export const get = () => _statusBar;

export const initialize = async () => {
    const mostRecentTask = getActiveTask();
    if (!!mostRecentTask) {
        changeTask(mostRecentTask);
    }
}

export const changeTask = (task: Task) => {
    // clear previous state
    if (!!_intervalID) { clearInterval(_intervalID) }

    // initialize state
    _intervalID = setInterval(() => {
        changStatusBar(task); 
    }, 5000);
}

const overTimeStyle = {"style": "background-color: IndianRed;"};
const nearOverstyle = {"style": "background-color: PapayaWhip;"};
const normalstyle = {};
const changStatusBar = (task: Task) => {
    _statusBar?.firstChild?.remove();
    const style = task.overTime ? overTimeStyle : task.nearOver ? nearOverstyle : normalstyle; 
    _statusBar?.createEl("span", { text: taskToStausBar(task), attr: style });
}