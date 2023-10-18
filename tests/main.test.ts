import { Editor, FileSystemAdapter, MarkdownView, Plugin } from "obsidian";
import { expect } from "chai";
import { DEFAULT_SETTINGS } from "settings";
import { remove, read, write, find } from "service/file.service";
import * as app from 'state/app.state';
import * as settings from 'state/settings.state';
import * as statusBar from 'service/status-bar.service';
import * as dv from 'service/data-view.service';
import { STask } from "obsidian-dataview";
import { taskModelTests } from "./task.model.test";

export const PLUGIN_NAME = "obsidian-task-tracking";
export const TARGET_FILE_NAME = "TargetFile.md";
export const DATA_FILE_NAME = "DataFile.json";

/*
    left off: with fixing test cases after resorting to importing settings in test
*/

export default class TestTaskTrackingPlugin extends Plugin {
    tests: Array<{ name: string; suite?: string; fn: () => Promise<void> }>;
    // plugin: TaskTrackingPlugin;
    // settings: Settings;
    statusBar: HTMLElement = {
        firstChild: null,
        createEl: () => {}
    } as unknown as HTMLElement; 

    // // todo: try to code around this limitaion
    // async load_settings(): Promise<void> {
    //     this.settings = Object.assign({}, DEFAULT_SETTINGS);
    // }

    /*
        war story, I was having seemingly random failures when trying to access a file I had just created.
        The issue was timing. The Obsidian App had not yet initialized the vault when I created the files
        this means they were never added to the vault.root.children and could not be referenced in the test.
        might need to increase the timeout for larger vaults
    */
    async onload() {
        app.set(this.app);
        settings.set(Object.assign({}, DEFAULT_SETTINGS));
        if(!(app.get().vault.adapter instanceof FileSystemAdapter)) {
            throw new Error("adapter must be a file system");
        }
        await new Promise(r => setTimeout(r, 1000));
        
        const intr = setInterval(function(t) {
            if (t.app.vault.getRoot().children.length > 0 &&    // vault on-change listener is set and can pick up test files adding
                !!t.app.workspace.rootSplit ) { // can use leaf 
                clearInterval(intr);
                t.run(); 
            } else {
                console.log("not done");
            }
          }, 1000, this)

    }

    async run() {
        await this.load_tests();
        await this.run_tests();
        await this.teardown();
    }

    async setup() {
		statusBar.set(this.addStatusBarItem());
        // settings.get().taskDataFileName = DATA_FILE_NAME;
        // todo: still need to get the TFile somehow, maybe I can create it myself
        const file = find(TARGET_FILE_NAME);
        await this.app.workspace.getLeaf().openFile(file);  // replicates the use case of interacting with a file in editor
    }

    async teardown() {
        await remove(TARGET_FILE_NAME);
        await remove(DATA_FILE_NAME);
    }

    async disable_external_plugins() {
        for (const plugin_name of Object.keys(this.plugins.plugins)) {
            if (plugin_name !== PLUGIN_NAME && plugin_name !== this.manifest.id) {
                await this.plugins.plugins[plugin_name].unload();
            }
        }
    }

    async enable_external_plugins() {
        for (const plugin_name of Object.keys(this.plugins.plugins)) {
            if (plugin_name !== PLUGIN_NAME && plugin_name !== this.manifest.id) {
                await this.plugins.plugins[plugin_name].load();
            }
        }
    }

    async load_tests() {
        this.tests = new Array();
        await this.loadTestSuite(taskModelTests);
        const focusedTests = this.tests.filter(t => t.name.startsWith("fff"));
        if (focusedTests.length > 0) {
            this.tests = focusedTests;
        }
    }

    async loadTestSuite(loadSuite: Function) {
        await loadSuite(this);
        this.tests.filter(t => !t.suite).forEach(t => t.suite = loadSuite.name);
    }

    test(name: string, fn: () => Promise<void>) {
        this.tests.push({ name, fn })
    }

    async run_tests() {
        for (let test of this.tests) {
            try {
                await test.fn();
                console.log(`✅ ${test.suite}: ${test.name}`);
            } catch (e) {
                console.log(`❌ ${test.suite}: ${test.name}`);
                console.error(e);
            }
        }
    }

    get view(): MarkdownView {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) {
            throw Error("view is undefined");
        }
        return view;
    }

    get editor(): Editor {
        const editor = this.view.editor;
        if (!editor) {
            throw Error("editor is undefined");
        }
        return editor;
    }

    get plugins(): any { 
        // @ts-ignore 
        return this.app.plugins
    }

    /*
        shared methods used across test suites
    */
    async setupEditorTest(fileContent: string, intialData = {}, line = 0) {
        await write(TARGET_FILE_NAME, fileContent);
        await write(DATA_FILE_NAME, JSON.stringify(intialData));
        await this.setup();
        this.editor.setCursor(line);
        this.resetState();
    }

    resetState() {

    }

    expectTimeInRange(actual: Date, lowerBound = 1000, upperBound = 100) {
        expect(actual)      // actual time should be before expected time
            .greaterThan(new Date(actual.getTime() - lowerBound))
            .lessThan(new Date(actual.getTime() + upperBound));
    }

    async expectTargetFile(expectedFileContent: string) {
        const targetFile = await read(TARGET_FILE_NAME);
        expect(targetFile).to.eql(expectedFileContent);     // taskID added to selected task
    }
    
    // async expectNoChanges(fileContent: string, initialData = {}) {
    //     const data = await this.getData();
    //     await expect(JSON.stringify(data)).to.eql(JSON.stringify(initialData));  // data file unchanged 
    //     expect(await read(TARGET_FILE_NAME)).to.eql(fileContent) // target file unchanged
    // }
}
