import { expect } from "chai";
import { filterOutliers } from "../service/array.service";


test('averageList', () => {
    const data = [2, 8, 12, 13, 17, 19, 25, 55, 80, 115];
    const actual = filterOutliers(data);
    expect(actual).to.have.members([ 2, 8, 12, 13, 17, 19 ]);
});