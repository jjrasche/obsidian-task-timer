import { Status } from "./status";
import { expect } from "chai";
import { STask } from "obsidian-dataview";
import { Task, orderTasks, pullEtc, pullStart, pullTimeTaken, staskToTask, taskToLine, taskToSelect, taskToStausBar } from "./task.model";


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
    expect(new Task({phrase: "hello [link](http://link.com)"} as Task).readablePhrase).to.eql("hello link (0)");
    expect(new Task({phrase: "hello [[link]]"} as Task).readablePhrase).to.eql("hello link (0)");
    expect(new Task({phrase: "hello [[link|other name]]"} as Task).readablePhrase).to.eql("hello other name (0)");
    expect(new Task({phrase: "hello [[#^aa3ab2|other name]]"} as Task).readablePhrase).to.eql("hello other name (0)");
});

test('readablePhrase', () => {
    const data = [
        { "order": 1, "phrase": "sprint, setup next sprint for me", "originalStatus": "/", "status": 1, "timeTaken": 20, "etc": 5, "startTime": new Date("2023-10-24T15:29:00.000Z"), "path": "resource/Dailies/23-10-24.md", "line": 4 } as unknown as Task,
        { "order": 2, "phrase": "qb, lauren, pa106 fix external segment no discriminator issue", "originalStatus": "/", "status": 1, "timeTaken": 14, "etc": 15, "startTime": new Date("2023-10-24T15:40:00.000Z"), "path": "resource/Dailies/23-10-24.md", "line": 6 } as unknown as Task,
        { "order": 3, "phrase": "sprint, create review document", "originalStatus": "/", "status": 1, "timeTaken": 16, "etc": 20, "startTime": new Date("2023-10-24T14:24:00.000Z"), "path": "resource/Dailies/23-10-24.md", "line": 8 } as unknown as Task,
        { "order": 4, "phrase": "crm, modify CRM export query in [format](https://setseg-my.sharepoint.com/:x:/g/personal/sandary_setseg_org/EVsujpGv-ydIrCD4dxQapMoBcNMzMI_fpI4-7ZAdxvfPuA?wdOrigin=TEAMS-ELECTRON.p2p_ns.bim&wdExp=TEAMS-CONTROL&wdhostclicktime=1698155727220&web=1)", "originalStatus": "/", "status": 1, "timeTaken": 40, "etc": 5, "startTime": new Date("2023-10-24T14:48:00.000Z"), "path": "resource/Dailies/23-10-24.md", "line": 9 } as unknown as Task,
        { "order": 5, "phrase": "tt, understand obsidian chart pie graph [chartjs docs](https://www.chartjs.org/docs/latest/charts/doughnut.html)", "originalStatus": "/", "status": 1, "timeTaken": 13, "etc": 5, "startTime": new Date("2023-10-24T11:45:00.000Z"), "path": "resource/Dailies/23-10-24.md", "line": 20 } as unknown as Task,
        { "order": 6, "phrase": "tt, bug, ordering issue on managed tasks", "originalStatus": "*", "status": 0, "timeTaken": 25, "etc": 5, "startTime": new Date("2023-10-24T16:12:00.000Z"), "path": "resource/Dailies/23-10-24.md", "line": 24 } as unknown as Task
    ]
    const actual = data.sort(orderTasks);
    expect(actual.map(t => (t as any).order)).to.eql([6,2,1,4,3,5]);
});
