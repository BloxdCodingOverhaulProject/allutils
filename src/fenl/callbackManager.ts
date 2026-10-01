// Callback Manager for the execution of multiple callbacks and modular addition of callbacks.
// Written by fenl, 2026

// TODO:

// Write a CallbackInterceptor class that intercepts callbacks when they are called and overwrites
// them. Potentially useful in edge cases.

// Write a CustomCallback class that allows for callbacks that are wrappers of other callbacks,
// e.g. onOwnerClick as a wrapper of onPlayerClick that is called when the owner of the lobby
// clicks.

// Write a permanent callback utility that pins callbacks. This will allow for different priority
// levels of callbacks, such as separating system callbacks from user ones in operating systems.

// Importing callbacks from an external file is the best decision here, as
// the file might be used by other modules.
import callbacks from '../json/callbackNames.json'
// In old versions, a callbackManager object was used, but the revised version
// is object-oriented and executes with a static registry.

export default class Callback {
    // Within this, each callback is its own key and contains regist, which
    // is a record of symbols to functions, and funcs, which is an array
    // of symbols. While not strictly neccessary, this allows for callbacks
    // to be ordered, which is a nice quality-of-life feature.
    static regist: Record<
        string,
        {
            regist: Record<symbol, (...args: any[]) => any>
            funcs: symbol[]
        }
        // I don't know if there is an easier method here, but I just Object.fromEntries
        // it to convert it to a blank template object.
    > = Object.fromEntries(callbacks.map((i) => [i, { regist: {}, funcs: [] }]))
    // The ID is a symbol that is indexible within funcs.
    private id: symbol
    // The callName is the callback that this class instance is representing.
    // This is superior over separate methods for each callback because of
    // ease-of-coding and easy variable-callback creation.
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
        // Creates a blank symbol for the identification. In hindsight, I probably
        // could have put this within the class definition, but this way it has
        // more clarity.
        this.id = Symbol()
        // Set the callbackName
        this.callName = name
        // This line adds the corresponding entry pair to the registry for the
        // corresponding callback name, allowing it to be accessed later on.
        Callback.regist[name].regist[this.id] = func
        // This line adds the corresponding symbol to the registry of the
        // corresponding callback name.
        Callback.regist[name].funcs.push(this.id)
    }
    /**
     * Remove the callback from the registry.
     * This will prevent the callback from being triggered again.
     */
    delete() {
        // This deletes the function associated with the identification
        // symbol, and it helps save on small amounts of memory.
        delete Callback.regist[this.callName].regist[this.id]
        // This splices away the index of the identification symbol
        Callback.regist[this.callName].funcs.splice(
            // This finds the index of the identification symbol
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
        // The callback is temporarily deleted to prevent the
        // callback from being executed twice.
        Callback.regist[this.callName].funcs.splice(
            Callback.regist[this.callName].funcs.indexOf(this.id),
            1,
        )
        // Here, the callback is added back.
        Callback.regist[this.callName].funcs.push(this.id)
    }
    /**
     * Modifies the callback with the given function. This will replace the existing
     * callback with the new one, and any arguments passed to the original callback
     * will now be passed to the new one.
     * @param { (...args: any[]) => any } fn - The new function to use as the callback
     */
    modifyCallback(fn: (...args: any[]) => any) {
        Callback.regist[this.callName].regist[this.id] = fn
    }
}

// This iterates through all the callbacks and defines the logic for each function.
// GlobalThis is used here for variable callback setting.
// Within each function, it executes each function within that registry and sets
// the return value of it if the return value of the function is not undefined.
// Callback Prioritization exists because of a quirk in this -- since functions
// are executed front-to-back, later functions will override earlier functions.
// In the future, I might add a "permament callback" utility that pins callbacks.
for (let callback of callbacks) {
    ;(globalThis as Record<any, any>)[callback] = function (...args: any[]) {
        let returnValue: any = undefined
        for (let j of Callback.regist[callback].funcs) {
            let out = Callback.regist[callback].regist[j](...args)
            if (out !== undefined) {
                returnValue = out
            }
        }
        return returnValue
    }
}
