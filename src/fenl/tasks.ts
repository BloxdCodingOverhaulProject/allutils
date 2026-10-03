// Task Scheduler for easy task handling
// Written by fenl, 2026

// A custom task scheduler is better than using Bloxd's native task scheduler due to
// stability, customizability, and ease of use.

import time from './timekeeper.js'
import cb from './callbackManager.js'
import ecb from './colorBroadcast.js'
let tasks: Record<number, task[]> = {}
type task = {
    fn: () => any
    err: (arg0: Error) => any
}
function defaultErrorHandler(v: Error) {
    ecb(`/{red}${v.message}/{white}:\n/{lightblue}${v.stack}`)
}
/**
 * Schedules a task to be executed after a certain delay.
 * @param {number} delay - The delay in ticks.
 * @param {() => any} fn - The function to be executed after the delay.
 */
export function schedule(
    delay: number,
    fn: () => any,
    err: (arg0: Error) => any = defaultErrorHandler,
) {
    if (tasks[delay + time]) {
        tasks[delay + time].push({ fn, err })
    } else {
        tasks[delay + time] = [{ fn, err }]
    }
}
new cb('tick', function () {
    if (tasks[time]) {
        for (let i of tasks[time]) {
            try {
                i.fn()
            } catch (err) {
                i.err(err)
            }
        }
        delete tasks[time]
    }
})
