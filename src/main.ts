import { Status } from 'model/status';
import { Editor, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS } from 'settings';
import * as app from 'state/app.state';
import * as settings from 'state/settings.state';
import * as statusBar from 'service/status-bar.service';
import * as dv from 'service/data-view.service';
import * as wait from 'service/wait.service';
import { TaskToggleModal } from 'task-toggle-modal';
import { getLogFileName } from 'service/logging.service';
import { updateTaskFromEditor } from './service/modify-task.service';

export default class TaskTrackingPlugin extends Plugin {
	statusBar: HTMLElement;

	async onload() {
		app.set(this.app);
		settings.set(Object.assign({}, { ...DEFAULT_SETTINGS, logFileName: getLogFileName() }, await this.loadData()));
		statusBar.set(this.addStatusBarItem());
		wait.until(() => dv.ready(), this.setup);
	}

	setup = async () => {
		// due to limitations of obsidian adding icons, I must use icon swapper and inject new svgs to get icons I want
		this.addCommand({ id: 'activate-task-command', icon: "dot-network", name: 'Activate Task', hotkeys: [{ modifiers: ["Alt"], key: "a" }], editorCheckCallback: this.editorCallback(Status.Active) });
		this.addCommand({ id: 'inactivate-task-command', icon: "double-down-arrow-glyph", name: 'Inactivate Task', hotkeys: [{ modifiers: ["Alt"], key: "i" }], editorCheckCallback: this.editorCallback(Status.Inactive) });
		this.addCommand({ id: 'complete-task-command', icon: "double-up-arrow-glyph", name: 'Complete Task', hotkeys: [{ modifiers: ["Alt"], key: "c" }], editorCheckCallback: this.editorCallback(Status.Complete) });
		this.addCommand({ id: "toggle-task", icon: "yesterday-glyph", name: "Toggle Task", hotkeys: [{ modifiers: ["Alt"], key: "t" }], callback: async () => new TaskToggleModal(this.app).open() });
		
		statusBar.set(this.addStatusBarItem());
		statusBar.initialize();
	}

	editorCallback = (status: Status) => (check: boolean, editor: Editor) => {
		if (!!check) { return !!editor; }
		updateTaskFromEditor(editor, status);
	};
}

