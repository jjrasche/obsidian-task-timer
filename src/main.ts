import { Status } from 'model/status';
import { Editor, Plugin, TAbstractFile } from 'obsidian';
import { DEFAULT_SETTINGS } from 'settings';
import * as app from 'state/app.state';
import * as settings from 'state/settings.state';
import * as statusBar from 'service/status-bar.service';
import * as dv from 'service/data-view.service';
import * as wait from 'service/wait.service';
import { TaskToggleModal } from 'task-toggle-modal';
import { getLogFileName } from 'service/logging.service';
import { updateTaskFromEditor } from './service/modify-task.service';
import { managedTaskFiles } from 'service/data-view.service';
import { Task } from './model/task.model';
import { find, read } from './service/file.service';
import { formatDate, minutesSince, simpleDisplayDate } from './service/date.service';

/*
  Design
  - don't allow tasks to carry over from previous day  
*/
// todo: consider outputs	
export default class TaskTrackingPlugin extends Plugin {
	statusBar: HTMLElement;

	async onload() {
		app.set(this.app);
		settings.set(Object.assign({}, { ...DEFAULT_SETTINGS, logFileName: getLogFileName() }, await this.loadData()));
		statusBar.set(this.addStatusBarItem());
		wait.until(() => dv.ready(), this.setup, 20, 2000);
	}

	setup = async () => {
		// due to limitations of obsidian adding icons, I must use icon swapper and inject new svgs to get icons I want
		this.addCommand({ id: 'activate-task-command', icon: "dot-network", name: 'Activate Task', hotkeys: [{ modifiers: ["Alt"], key: "a" }], editorCheckCallback: this.editorCallback(Status.Active) });
		this.addCommand({ id: 'inactivate-task-command', icon: "double-up-arrow-glyph", name: 'Inactivate Task', hotkeys: [{ modifiers: ["Alt"], key: "i" }], editorCheckCallback: this.editorCallback(Status.Inactive) });
		this.addCommand({ id: 'complete-task-command', icon: "double-down-arrow-glyph", name: 'Complete Task', hotkeys: [{ modifiers: ["Alt"], key: "c" }], editorCheckCallback: this.editorCallback(Status.Complete) });
		this.addCommand({ id: "toggle-task", icon: "yesterday-glyph", name: "Toggle Task", hotkeys: [{ modifiers: ["Alt"], key: "t" }], callback: async () => new TaskToggleModal(this.app).open() });
		
		statusBar.set(this.addStatusBarItem());
		statusBar.initialize();
		// this.registerEvent(this.app.vault.on("modify", this.onManagedFileUpdateStatusBar));
	}

	onManagedFileUpdateStatusBar = (file: TAbstractFile) => {
		const managedFiles = managedTaskFiles();
		if (managedFiles.includes(file.path)) {
			console.log(`file change`)
			statusBar.initialize();
		}
	}
 
	editorCallback = (status: Status) => (check: boolean, editor: Editor) => {
		if (!!check) { return !!editor; }
		updateTaskFromEditor(editor, status);
	};

	/*
		helper methods to interact with data
	*/
	getAllTaskData = (): Task[] => dv.trackedTasks();

	getAllTasksByPath = (path: string): Task[] => dv.allTasks(path);
	formatDate = (date: Date = new Date()): string => formatDate(date); 

	// getDailyWorkPersonalUnTrackedTimeData = (d: Date): number[] => {
	// 	const dailyFileName = `resource/Dailies/${simpleDisplayDate(d ?? new Date())}`;
	// 	const tasks = dv.todaysTasks();
		
	// 	const workTasks = tasks.filter(t => t.isWork);
	// 	const workTime = workTasks.reduce((agg, curr) => agg += curr.timeSpent ?? 0, 0);
		
	// 	const nonWorkTasks = tasks.filter(t => !t.isWork);
	// 	const nonWorkTime = nonWorkTasks.reduce((agg, curr) => agg += curr.timeSpent ?? 0, 0);
		
	// 	const startOfDay = new Date(find(dailyFileName).stat.ctime);
	// 	const nonTrackedTime = minutesSince(startOfDay) - (workTime + nonWorkTime);
	// 	return [workTime, nonWorkTime, nonTrackedTime];
	// }

	getWeeklyFileName(): string {
 		// const date = new Date(`${tp.file.title.split('-')[1]}-${tp.file.title.split('-')[2]}-20${tp.file.title.split('-')[0]}`)
		const term = 14;
		const date = new Date();
		const origStart = new Date ("11-06-2023");
		const daysSince = Math.floor((date.getTime() - origStart.getTime()) / (1000 * 60 * 60 * 24))
		const termStart = new Date(new Date(origStart).setDate(origStart.getDate() + daysSince - daysSince % term));
		const termEnd = new Date(new Date(termStart).setDate(termStart.getDate() + term - 1));
		return `resource/weeklies/${formatDate(termStart)} to ${formatDate(termEnd)}.md`;
	}
}

