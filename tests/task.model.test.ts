import TestTaskTrackingPlugin from "./main.test";
import { Status } from "model/status";
import { expect } from "chai";
import { STask } from "obsidian-dataview";

/*
    hard to truly stub an exported function. I don't understand this fully
    https://dev.to/thekashey/please-stop-playing-with-proxyquire-11j4
    todo: understand the pattern for stubbing in TS

            // debugger;
        // const Task = proxyquire('../model/task.model', {
        //     './service/date.service': {
        //       default: function now() { return new Date(0)},
        //     },
        //   }).default;
        // debugger;
        // import * as date from 'service/date.service';

        // const myTestableFile = rewiremock(() => require('../model/task.model'), () => {
        //     rewiremock(() => require('service/date.service')).with(mock) 
        //   });
         // totaly mock `fs` with your stub 
*/
export function taskModelTests(t: TestTaskTrackingPlugin) {
    t.test("<method>", async () => {
    });

}