export const DEFAULT_SETTINGS: Settings = {
    logFileName: ".obsidian/plugins/obsidian-task-timer/log.txt",
};

export interface Settings {
    logFileName: string;
}
