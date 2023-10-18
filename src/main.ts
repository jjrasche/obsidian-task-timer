import { Status } from 'model/status';
import { Editor, Platform, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS } from 'settings';
import { updateTaskFromEditor } from 'service/modify-task.service';
import * as app from 'state/app.state';
import * as settings from 'state/settings.state';
import * as statusBar from 'service/status-bar.service';
import * as dv from 'service/data-view.service';
import * as wait from 'service/wait.service';
import { TaskToggleModal } from 'task-toggle-modal';
import { getLogFileName } from 'service/logging.service';
import { convertStaskToTask } from 'model/task.model';
import { STask } from 'obsidian-dataview';

// due to limitations of obsidian adding icons, I must use icon swapper and inject new svgs to get icons I want
const circleAIcon = "dot-network";
const circleCIcon = "double-down-arrow-glyph";
const circleIIcon = "double-up-arrow-glyph";
const circleITcon = "yesterday-glyph";

export default class TaskTrackingPlugin extends Plugin {
	statusBar: HTMLElement;

	async onload() {
		app.set(this.app);
		settings.set(Object.assign({}, { ...DEFAULT_SETTINGS, logFileName: getLogFileName() }, await this.loadData()));
		statusBar.set(this.addStatusBarItem());
		wait.until(() => dv.ready(), this.setup);
	}

	
	setup = async () => {		
		this.addCommand({ id: 'activate-task-command', icon: circleAIcon, name: 'Activate Task', hotkeys: [{ modifiers: ["Alt"], key: "a" }], editorCheckCallback: this.editorCallback(Status.Active) });
		this.addCommand({ id: 'inactivate-task-command', icon: circleIIcon, name: 'Inactivate Task', hotkeys: [{ modifiers: ["Alt"], key: "i" }], editorCheckCallback: this.editorCallback(Status.Inactive) });
		this.addCommand({ id: 'complete-task-command', icon: circleCIcon, name: 'Complete Task', hotkeys: [{ modifiers: ["Alt"], key: "c" }], editorCheckCallback: this.editorCallback(Status.Complete) });
		this.addCommand({ id: "toggle-task", icon: circleITcon, name: "Toggle Task", hotkeys: [{ modifiers: ["Alt"], key: "t" }], callback: async () => new TaskToggleModal(this.app).open() });
		
		statusBar.set(this.addStatusBarItem());
		// statusBar.initialize();


	}

	editorCallback = (status: Status) => (check: boolean, editor: Editor) => {
		if (!!check) {
			return !!editor;
		}
		updateTaskFromEditor(editor, status);
	};
}

