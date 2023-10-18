export async function until(ready: () => boolean, callback: () => void, interval = 1000): Promise<void> {
    return await new Promise(resolve => {
        let maxAttempts = 30;
        const start = new Date();
        const intervalID = setInterval(() => {
            if (ready()) {
                callback();
                clearInterval(intervalID);
                resolve();
            };
            maxAttempts--;
            let seconds = (new Date()).getTime() - start.getTime();
            console.log(`attempt ${maxAttempts} after ${seconds} seconds`);
            if (maxAttempts == 0) {
                seconds = (new Date()).getTime() - start.getTime();
                console.log(`reached max attempts of ${maxAttempts} after ${seconds} seconds`);
                clearInterval(intervalID);
                resolve();
            }
        }, interval);
    });
}