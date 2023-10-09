// import { Task } from 'model/task.model';
// import { BehaviorSubject, Observable } from 'rxjs';
// import * as log from 'service/logging.service';
// import { allManagedTasks } from 'service/data-view.service';

// type TaskFilter = (task: Task) => boolean;
// let _tasks = new BehaviorSubject<Task[] | undefined>(undefined);

// // todo ??? will dataview update automatically... should I listen to that rather than modyify state based on this plugin's changes
// // export const add = async (task: Task) => {
// //     const existingTasks = await initialize();
// //     const tasks = [...existingTasks, task];
// //     await set(tasks);
// // }

// export const set = async(tasks: Task[]) => {
//     _tasks.next(tasks);
// }

// export const getChangeListener = (): Observable<Task[] | undefined> => _tasks.asObservable();
// export const get = (filter ?: TaskFilter): Promise<Task[]> => {
//     const tasks = allManagedTasks();
//     return !!filter ? tasks.filter(task => filter(task)) : tasks;
// }
// export const getMostRecent = async (): Promise<Task | undefined> => {
//     const tasks = await get();
//     let mostRecentTask: Task | undefined;
//     let mostRecentTime = new Date(0);
//     tasks.forEach(task => {
//         task.events.forEach(event => {
//             if (event.time > mostRecentTime) {
//                 mostRecentTask = task;
//                 mostRecentTime = event.time;
//             }
//         });
//     });
//     return mostRecentTask;
// }