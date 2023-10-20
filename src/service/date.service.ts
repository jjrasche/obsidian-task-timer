export function now (): Date { return new Date() }
export function nowIso (): string { return now().toISOString() }
export const readableNow = (): string => readable(now());
export const readable = (d: Date): string => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;  // yyyy-mm-dd hh:mm:ss
export const from = (time: number) => new Date(time); 
export const min  = new Date(-8640000000000000);
export const max = new Date(8640000000000000);
export const sameDay = function(date: Date, day: Date): boolean {
  return date.getDate() == day.getDate() &&
    date.getMonth() == day.getMonth() &&
    date.getFullYear() == day.getFullYear()
}
export const inSprint = function(date: Date): boolean {
  const firstSprintDate = new Date("10-11-2022 11:30");
  // const sprintStart = new Date();
  // sprintStart.setDate(sprintStart.getDate() - 14)
  return date.getDate() > firstSprintDate.getDate();
}
export const isToday = (date: Date): boolean => sameDay(date, new Date()); 

// 231019 into 2023-10-19
export const convertSimpleDate = (d: string, t?: string): Date => {
    if (t!!) {
        return new Date (`20${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)} ${t.slice(0, t.length-2)}:${t.slice(-2)}`);
    } else {
        return new Date (`20${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)}`);
    }
}

export const simpleDate = (d?: Date): string => !!d ? `${d.getFullYear().toString().slice(2)}${(new Date()).getMonth() + 1}${d.getDate()}` : "";
export const simpleTime = (d?: Date): string => !!d ? `${d.getHours().toString().padStart(2, "0")}${d.getMinutes().toString().padStart(2, "0")}` : "";
export const simpleDisplayDate = (d?: Date): string => !!d ? `${d.getFullYear().toString().slice(2)}-${(new Date()).getMonth() + 1}-${d.getDate()}` : "";
export const simpleDisplayTime = (d?: Date): string => !!d ? `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}` : "";