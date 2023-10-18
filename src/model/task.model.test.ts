import { Status } from "./status";
import { expect } from "chai";
import { STask } from "obsidian-dataview";
import { Task, pullEtc, pullStart, pullTimeTaken, staskToTask, taskToLine } from "./task.model";


// test('pullEtc', () => metadataCheck(pullEtc, "blah", "  e:20", 20));
// test('pullStart', () => metadataCheck(pullStart, "blah", " d:231019 s:517", new Date("2023-10-19 5:17")));
// test('pullTimeTaken', () => metadataCheck(pullTimeTaken, "blah", "t:21", 21));
// test('pullMetadata with du  plicate', () => { expect(() => pullEtc("blah e:15 e:20")).to.throw() });

// const metadataCheck = (method: (str: string) => [string, any?], phrase: string, metadata: string, expected: any) => {
//     const text = `${phrase} ${metadata}`;
//     const [actualPhrase, actualMeta] = [...method(text)];
//     expect(actualMeta).to.eql(expected);
//     expect(actualPhrase).to.eql(phrase);
// }

// test('staskToTask no metadata', () => taskCheck(staskToTask({ text: "blah^39do3d"} as STask), { phrase: "blah", link:"^39do3d"}));

// test('staskToTask no metadata', () => taskCheck(staskToTask({ text: "blah "} as STask), { phrase: "blah" }));
// test('staskToTask with metadata', () => {
//     const expected = { phrase: "blah", etc:20, timeTaken:25, startTime: new Date("2023-10-06 17:18") }
//     taskCheck(staskToTask({ text: "blah d:231006 s:1718 e:20 t:25"} as STask), expected);
// })
// test('staskToTask status',  () => {
//     taskCheck(staskToTask({ text: "blah", status: ""} as STask), { status: Status.Inactive });
//     taskCheck(staskToTask({ text: "blah", status: "*"} as STask), { status: Status.Active });
//     taskCheck(staskToTask({ text: "blah", status: "/"} as STask), { status: Status.Inactive });
//     taskCheck(staskToTask({ text: "blah", status: "x"} as STask), { status: Status.Complete });
//     taskCheck(staskToTask({ text: "blah", status: "c"} as STask), { status: Status.Inactive });
// });

// const taskCheck = (actual: any, expected: any) => {
//     Object.keys(expected).forEach(key => {
//         expect(actual[key]).to.eql(expected[key], `expected ${key} to equal ${expected[key]} but actually ${actual[key]}`);
//     });
// }

test('taskToLine no metadata', () => lineCheck(new Task({ phrase: "blah", status: Status.Inactive } as Task), "- [/] blah"));
test('taskToLine link', () => lineCheck(new Task({ phrase: "blah", status: Status.Active, link: "^39do3d" } as Task), "- [*] blah ^39do3d"));
test('taskToLine kitchen sink', () => lineCheck(
    new Task({ 
        phrase: "blah",
        status: Status.Active,
        link: "^39do3d",
        etc: 11,
        timeTaken: 15,
        startTime: new Date("2023-10-19 18:22")
    } as Task),
    "- [*] blah d:231019 s:1822 e:11 t:15 ^39do3d"
    ));

const lineCheck = (task: Task, expected: string) => {
    const actual = taskToLine(task);
    expect(actual).to.eql(expected);
}


// const getData = (): STask => ({
//     "section": {
//         "path": "archive/Projects/build kid's good habits/project.md",
//         "type": "header",
//         "subpath": "Todo"
//     },
//     "text": "research teaching kids about money etc:30",
//     "tags": [],
//     "line": 8,
//     "path": "archive/Projects/build kid's good habits/project.md",
//     "children": [],
//     "subtasks": [],
//     "status": " "
// });

// const getExpected = (): Task => {
//     return new Task({
//         file: "archive/Projects/build kid's good habits/project.md",
//         lineNum: 8,
//         phrase: "research teaching kids about money",
//         etc: 30
//     } as Task);
// };