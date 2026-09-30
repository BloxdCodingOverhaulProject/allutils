import callbacks from '../json/callbackNames.json'
export class Callback {
    static regist: Record<
        string,
        {
            regist: Record<symbol, () => any>
            funcs: symbol[]
        }
    > = Object.fromEntries(callbacks.map((i) => [i, { regist: {}, funcs: [] }]))
    private id: symbol
    private callName: string

    /**
     * Create a new callback instance.
     * @param {string} name - The name of the callback to register with.
     * @param {() => any} func - The function to call when the callback is triggered.
     */
    constructor(name: string, func: () => any) {
        if (!Callback.regist[name]) {
            throw new Error(`Invalid callback created, name: ${name}`)
        }
        this.id = Symbol()
        this.callName = name
        Callback.regist[name].regist[this.id] = func
        Callback.regist[name].funcs.push(this.id)
    }
    /**
     * Remove the callback from the registry.
     * This will prevent the callback from being triggered again.
     */
    delete() {
        delete Callback.regist[this.callName].regist[this.id]
        Callback.regist[this.callName].funcs.splice(
            Callback.regist[this.callName].funcs.indexOf(this.id),
            1,
        )
    }
    /**
     * Prioritize the callback. This will move the callback to the end of the list
     * of callbacks to be triggered. This is useful for overriding other callbacks
     * or ensuring that a callback is triggered last.
     */
    prioritize() {
        Callback.regist[this.callName].funcs.splice(
            Callback.regist[this.callName].funcs.indexOf(this.id),
            1,
        )
        Callback.regist[this.callName].funcs.push(this.id)
    }
}

for (let callback of callbacks) {
    ;(globalThis as Record<any, any>)[callback] = function (...args: any[]) {
        let returnValue: any = undefined
        for (let j of Callback.regist[callback].funcs) {
            let out = (
                Callback.regist[callback].regist[j] as (...args: any[]) => any
            )(...args)
            if (out != undefined) {
                returnValue = out
            }
        }
        return returnValue
    }
}
