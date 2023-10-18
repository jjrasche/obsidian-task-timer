import { Status } from "model/status";
import { expect } from "chai";
import { STask } from "obsidian-dataview";
import { Task, convertStaskToTask } from "./task.model";

test('1 + 1', () => {
    // arrange
    const stask = getData();
    // act
    const actual = convertStaskToTask(stask);
    // assert
    const expected = getExpected()
    expect(actual).to.eql(expected);
});

const getData = (): STask => ({
    "symbol": "-",
    "link": {
        "path": "archive/Projects/build kid's good habits/project.md",
        "type": "header",
        "subpath": "Todo"
    },
    "section": {
        "path": "archive/Projects/build kid's good habits/project.md",
        "type": "header",
        "subpath": "Todo"
    },
    "text": "research teaching kids about money etc:30",
    "tags": [],
    "line": 8,
    "lineCount": 1,
    "list": 8,
    "outlinks": [],
    "path": "archive/Projects/build kid's good habits/project.md",
    "children": [],
    "task": true,
    "annotated": false,
    "position": {
        "start": {
            "line": 8,
            "col": 0,
            "offset": 451
        },
        "end": {
            "line": 8,
            "col": 50,
            "offset": 501
        }
    },
    "subtasks": [],
    "real": true,
    "header": {
        "path": "archive/Projects/build kid's good habits/project.md",
        "type": "header",
        "subpath": "Todo"
    },
    "status": " ",
    "checked": false,
    "completed": false,
    "fullyCompleted": false
});

const getExpected = (): Task => {
    let task = new Task();
    task.file = "archive/Projects/build kid's good habits/project.md";
    task.lineNum = 8;
    task.name = "research teaching kids about money"
    task.estimateTimeToCompletion = 30;
    return task;
};