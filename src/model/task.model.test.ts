import { Status } from "./status";
import { expect } from "chai";
import { STask } from "obsidian-dataview";
import { Task, pullEtc, pullStart, pullTimeTaken, staskToTask, taskToLine, taskToSelect, taskToStausBar } from "./task.model";

test('pullEtc', () => metadataCheck(pullEtc, "blah", "  etc:20", 20));
test('pullEtc', () => metadataCheck(pullEtc, "blah", `  etc:20
`, 20));
test('pullStart', () => metadataCheck(pullStart, "blah", " d:231019 s:517", new Date("2023-10-19 5:17")));
test('pullTimeTaken', () => metadataCheck(pullTimeTaken, "blah", "t:21", 21));
test('pullMetadata with du  plicate', () => { expect(() => pullEtc("blah etc:15 etc:20")).to.throw() });

const metadataCheck = (method: (str: string) => [string, any?], phrase: string, metadata: string, expected: any) => {
    const text = `${phrase} ${metadata}`;
    const [actualPhrase, actualMeta] = [...method(text)];
    expect(actualMeta).to.eql(expected);
    expect(actualPhrase).to.eql(phrase);
}

test('staskToTask no metadata', () => taskCheck(staskToTask({ text: "blah^39do3d"} as STask), { phrase: "blah", link:"^39do3d"}));
test('staskToTask tabs', () => taskCheck(staskToTask({ text: "blah^39do3d", position: { start: { col: 2 }}} as STask), { phrase: "blah", tabs:"\t\t"}));
test('staskToTask no metadata', () => taskCheck(staskToTask({ text: "blah "} as STask), { phrase: "blah" }));
test('staskToTask with metadata', () => {
    const expected = { phrase: "blah", etc:20, timeTaken:25, startTime: new Date("2023-10-06 17:18") }
    taskCheck(staskToTask({ text: "blah d:231006 s:1718 etc:20 t:25"} as STask), expected);
})
test('staskToTask status',  () => {
    taskCheck(staskToTask({ text: "blah", status: ""} as STask), { status: Status.Inactive });
    taskCheck(staskToTask({ text: "blah", status: "*"} as STask), { status: Status.Active });
    taskCheck(staskToTask({ text: "blah", status: "/"} as STask), { status: Status.Inactive });
    taskCheck(staskToTask({ text: "blah", status: "x"} as STask), { status: Status.Complete });
    taskCheck(staskToTask({ text: "blah", status: "c"} as STask), { status: Status.Inactive });
});

const taskCheck = (actual: any, expected: any) => {
    Object.keys(expected).forEach(key => {
        expect(actual[key]).to.eql(expected[key], `expected ${key} to equal ${expected[key]} but actually ${actual[key]}`);
    });
}

test('taskToLine no metadata', () => lineCheck(new Task({ phrase: "blah", status: Status.Inactive } as Task), "- [/] blah"));
test('taskToLine link', () => lineCheck(new Task({ phrase: "blah", status: Status.Active, link: "^39do3d" } as Task), "- [*] blah ^39do3d"));
test('taskToLine link', () => lineCheck(new Task({ phrase: "blah", status: Status.Active, tabs: "    " } as Task), "    - [*] blah"));
test('taskToLine kitchen sink', () => lineCheck(
    new Task({ 
        phrase: "blah",
        status: Status.Active,
        link: "^39do3d",
        etc: 11,
        timeTaken: 15,
        startTime: new Date("2023-10-19 18:22")
    } as Task),
    "- [*] blah d:231019 s:1822 etc:11 t:15 ^39do3d")
);
test('taskToLine handle when single digits into hour correctly', () => lineCheck(
    new Task({ 
        phrase: 'hr, namely, [[2023 performance review]]',
        originalStatus: ' ',
        tabs: '',
        status: 0,
        etc: 30,
        startTime: new Date("Fri Oct 20 2023 13:03:56 GMT-0400 (Eastern Daylight Time)"),
        path: 'resource/Dailies/23-10-20.md',
        line: 7
    } as Task),
    "- [*] hr, namely, [[2023 performance review]] d:231020 s:1303 etc:30")
);

const lineCheck = (task: Task, expected: string) => {
    const actual = taskToLine(task);
    expect(actual).to.eql(expected);
}

test('createElement', () => {
    jest.spyOn(Task.prototype, 'now', 'get').mockImplementation(() => new Date("2023-10-19 18:10").getTime());

    const task = new Task({ 
        phrase: "blah",
        status: Status.Active,
        etc: 11,
        timeTaken: 15,
        startTime: new Date("2023-10-19 18:00")
    } as Task);
    const actual = taskToStausBar(task);
    expect(actual).to.eql(`blah -14`);
});

test('taskToSelect', () => {
    jest.spyOn(Task.prototype, 'now', 'get').mockImplementation(() => new Date("2023-10-19 18:10").getTime());
    let task = new Task({ phrase: "blah", status: Status.Active, etc: 11, timeTaken: 15, startTime: new Date("2023-10-19 18:00") } as Task);
    expect(taskToSelect(task)).to.eql(`A 18:00 (-14) blah`);
});


test('readablePhrase', () => {
    expect(new Task({phrase: "hello [link](http://link.com)"} as Task).readablePhrase).to.eql("hello link");
    expect(new Task({phrase: "hello [[link]]"} as Task).readablePhrase).to.eql("hello link");
    expect(new Task({phrase: "hello [[link|other name]]"} as Task).readablePhrase).to.eql("hello other name");
    expect(new Task({phrase: "hello [[#^aa3ab2|other name]]"} as Task).readablePhrase).to.eql("hello other name");
});