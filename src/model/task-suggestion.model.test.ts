import { expect } from "chai";
import { filterOutliers } from "../service/array.service";
import { suggestedTasks } from "../service/suggested-task.service";
import { TaskSuggestion } from "./task-suggestion.model";
import { Task } from "./task.model";
import { Status } from "./status";


test('averageList', () => {
    let data = [2, 8, 12, 13, 17, 19, 25, 55, 80, 115];
    let actual = filterOutliers(data);
    expect(actual).to.have.members([ 12, 13, 17, 19, 25, 55 ]);

    data = [4, 5, 8, 12, 13, 17, 19, 25, 30, 37];
    actual = filterOutliers(data);
    expect(actual).to.have.members([ 8, 12, 13, 17, 19, 25 ]);
});

/*
    suggestedTasks - group correctly
    suggestedTasks - sorted correctly

*/
const getA1 = () =>  new Task({ phrase: "a", path: "path1.md", header: "Work", timeTaken: 15 } as Task);
const getA2 = () =>  new Task({ phrase: "a", path: "path2.md", header: "Work", timeTaken: 10 } as Task);
const getA1P = () =>  new Task({ phrase: "a", path: "path1.md", header: "Personal", timeTaken: 10 } as Task);
const getB1 = () =>  new Task({ phrase: "b", path: "path1.md", header: "Work", timeTaken: 10 } as Task);
const getC1 = () =>  new Task({ phrase: "c", path: "path1.md", header: "Work", timeTaken: 10 } as Task);
test('suggestedTasks - group correctly - all same phrase in same header - has single suggestion', () => {
    const data = [ getA1(), getA2()];
    const actual = suggestedTasks(data);
    const expected = {phrase: "a", instances: data} as unknown as TaskSuggestion;
    expect(actual).to.eql([expected]);
});

test('suggestedTasks - group correctly - different phrases - 1 suggestion per phrase', () => {
    const data = [ getA1(), getA2(), getB1(), getC1()];
    const actual = suggestedTasks(data);
    const expected = [
        { instances: [getA1(), getA2()], phrase: "a" },
        { instances: [getB1()], phrase: "b" },
        { instances: [getC1()], phrase: "c" },
    ];
    expect(JSON.stringify(actual)).to.eql(JSON.stringify(expected));
});

// if in daily add header to work 
test('suggestedTasks - group correctly - same phrases different header in daily - 1 suggestion per phrase', () => {
    const data = [ getA1(), getA2(), getA1P()];
    const actual = suggestedTasks(data);
    const expected = [
        { instances: [getA1(), getA2()], phrase: "a" },
        { instances: [getA1P()], phrase: "a" },
    ];
    expect(JSON.stringify(actual)).to.eql(JSON.stringify(expected));
});