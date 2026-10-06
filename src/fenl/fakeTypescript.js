globalThis.Type = class {
    supposed
    name
    constructor(name, val) {
        this.supposed = Object.entries(val)
        this.name = name
    }
    isType(val) {
        for (let [k, v] of this.supposed) {
            let o = v.isType(val[k])
            if (o !== true) {
                return `Type ${this.name}.${k}: ${o}`
            }
        }
        return true
    }
}
function genericPrimitiveType(type) {
    return {
        isType(val) {
            if (typeof val == type) {
                return true
            } else {
                return `${JSON.stringify(val)} is not a ${type}`
            }
        },
        name: type,
    }
}
globalThis.Primitive = {
    number: genericPrimitiveType('number'),
    string: genericPrimitiveType('string'),
    boolean: genericPrimitiveType('boolean'),
    symbol: genericPrimitiveType('symbol'),
    bigint: genericPrimitiveType('bigint'),
    undefined: genericPrimitiveType('undefined'),
    function: genericPrimitiveType('function'),
    object: genericPrimitiveType('object'),
}
function typescript(name = 'globalThis', value = Object.create(null)) {
    return new Proxy(value, {
        set(target, property, newValue, receiver) {
            if (typeof newValue != 'object') {
                newValue = {
                    type: Primitive[typeof newValue],
                    value: newValue,
                }
            }
            if (!newValue?.type) {
                newValue = {
                    type: Primitive.object,
                    value: newValue,
                }
            }
            if (!newValue.type.isType(newValue.value)) {
                console.log(
                    `Warning: '${property}': ${newValue.value} is not of type ${newValue.type.name}`,
                )
            }
            if (Reflect.has(target, property)) {
                // Variable being set
                let old = Reflect.get(target, property)
                let cast1 = old.type.isType(newValue.value) // If they are both of type old.type
                let cast2 = newValue.type.isType(old.value) // If they are both of type newValue.type
                if (cast1 === true && cast2 === true) {
                    if (old.type != newValue.type) {
                        console.log(
                            `Note: ${old.type.name} seems to be like ${newValue.type.name}; setting ${name}.${property} to type ${old.type.name} (guessing it to be stronger)`,
                        )
                    }
                } else if (cast1 === true) {
                    // if old is a superset
                    console.log(
                        `Warning: Cast ${name}.${property} of super type ${old.type.name} (${JSON.stringify(old.value)}) to type ${newValue.type.name} (${JSON.stringify(newValue.value)})`,
                    )
                } else if (cast2 === true) {
                    // if newvalue is a superset
                    console.log(
                        `Warning: Cast ${name}.${property} of type ${old.type.name} (${JSON.stringify(old.value)}) to super type ${newValue.type.name} (${JSON.stringify(newValue.value)})`,
                    )
                } else {
                    console.log(
                        `Error: ${name}.${property} (${JSON.stringify(old.value)}) of type ${old.type.name} cannot be coerced to type ${newValue.type.name} (${JSON.stringify(newValue.value)}); ${cast1}; ${cast2}`,
                    )
                }
            }

            if (typeof newValue.value == 'object' && newValue.value !== null) {
                let oldValue = newValue.value
                newValue.value = typescript(name + '.' + property)
                for (let [k, v] of Object.entries(oldValue)) {
                    newValue.value[k] = v
                }
            }
            return Reflect.set(target, property, newValue)
        },
        get(target, property, receiver) {
            return (
                Reflect.get(target, property)?.value ??
                Reflect.get(target, property)
            )
        },
    })
}
Object.setPrototypeOf(globalThis, typescript())
