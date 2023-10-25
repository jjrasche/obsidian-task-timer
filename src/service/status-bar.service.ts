import { Task, taskToStausBar } from "../model/task.model";
import { getActiveTask } from "./data-view.service";

let _statusBar: HTMLElement;
let _intervalID: NodeJS.Timer;

export const set = (statusBar: HTMLElement) => _statusBar = statusBar;
export const get = () => _statusBar;

export const initialize = async () => {
    if (!!_intervalID) { clearInterval(_intervalID) }
    _intervalID = setInterval(() => changStatusBar(), 4000);
}


const overTimeStyle = {"style": "background-color: IndianRed;"};
const nearOverstyle = {"style": "background-color: PapayaWhip;"};
const normalstyle = {};
const changStatusBar = () => {
    // get most recent active task
    const task = getActiveTask();
    if (!task) return;
    // change status bar
    _statusBar?.firstChild?.remove();
    const style = task.overTime ? overTimeStyle : task.nearOver ? nearOverstyle : normalstyle; 
    _statusBar?.createEl("span", { text: task.readablePhrase, attr: style });
}