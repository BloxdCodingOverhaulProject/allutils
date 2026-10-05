class Type {
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
                return `${k} of type ${this.name}: ${o}`
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
                return `${val} is not a ${type}`
            }
        },
        name: type,
    }
}
const Primitive = {
    number: genericPrimitiveType('number'),
    string: genericPrimitiveType('string'),
    boolean: genericPrimitiveType('boolean'),
    symbol: genericPrimitiveType('symbol'),
    bigint: genericPrimitiveType('bigint'),
    undefined: genericPrimitiveType('undefined'),
    function: genericPrimitiveType('function'),
    object: genericPrimitiveType('object'),
}
function setToTypescript() {
    return new Proxy(Object.create(null), {
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
                let cast1 = newValue.type.isType(old.value) // If they are both of type old.type
                let cast2 = old.type.isType(newValue.value) // If they are both of type newValue.type
                if (cast1 === true && cast2 === true) {
                    console.log(
                        `Note: ${old.type.name} seems to be like ${newValue.type.name}; setting '${property}' to type ${old.type.name} (guessing it to be stronger)`,
                    )
                } else if (cast1 === true) {
                    // if old is a superset
                    console.log(
                        `Warning: Cast '${property}' of super type ${old.type.name} (${JSON.stringify(old.value)}) to type ${newValue.type.name} (${JSON.stringify(newValue.value)})`,
                    )
                } else if (cast2 === true) {
                    // if newvalue is a superset
                    console.log(
                        `Warning: Cast '${property}' of type ${old.type.name} (${JSON.stringify(old.value)}) to super type ${newValue.type.name} (${JSON.stringify(newValue.value)})`,
                    )
                } else {
                    console.log(
                        `Error: '${property}' (${JSON.stringify(old.value)}) of type ${old.type.name} cannot be coerced to type ${newValue.type.name} (${JSON.stringify(newValue.value)}); ${newValue.type.isType(old.value)}; ${old.type.isType(newValue.value)}`,
                    )
                }
                return Reflect.set(target, property, newValue)
            } else {
                return Reflect.set(target, property, newValue)
            }
        },
    })
}
Object.setPrototypeOf(globalThis, setToTypescript())
