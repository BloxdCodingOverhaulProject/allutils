import aoos from './allOccurencesOfSubstring.js'
/**
 * Log a message with color styling.
 * The styling is of format \{}, where the content within is
 * delimited with semicolons.
 * @example
 * ecb(`/{c;white}White/{c;blue}Blue/{c;red}Red`)
 * @param {string} val The string to be printed with color.
 * @throws {Error} If the string is invalid.
 */
export default function ecb(val: string) {
    // Split it into color parts
    let cols = aoos(val, '/{')
    // Push the length into it to act as an end marker
    cols.push(val.length)
    // Add the beginning before color formatting
    let o: any = [val.slice(0, cols[0])]
    for (let i = 0; i < cols.length - 1; i++) {
        let style: Record<string, any> = {}
        let idx = cols[i] + 2
        // Parse through the characters
        while (val[idx] != '}') {
            let key = ''
            do {
                if (idx == val.length)
                    throw new Error(`Something bad happened. Try again.`)
                key += val[idx]
            } while (val[++idx] != ';')
            idx++
            let value = ''
            do {
                if (idx == val.length)
                    throw new Error(`Something bad happened. Try again.`)
                value += val[idx]
            } while (val[++idx] != ';' && val[idx] != '}')
            style[key] = value
        }
        // Push the color and the text, using the next color marker as an endpoint
        o.push({
            str: val.slice(idx + 1, cols[i + 1]),
            style: {
                color: style?.c || style?.col || style?.color,
            },
        })
    }
    api.broadcastMessage(o)
}
