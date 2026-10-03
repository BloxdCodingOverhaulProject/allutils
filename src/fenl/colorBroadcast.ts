import aoos from './allOccurencesOfSubstring.js'
/**
 * Log a message with color styling.
 * The styling is of format \{}, where the content within is
 * delimited with semicolons.
 * @example
 * ecb(`\{white}White\{blue}Blue\{red}Red`)
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
        let idx = cols[i] + 4
        // Parse through the characters
        while (val[idx] != '}') {
            let key = ''
            while (val[idx++] != ';') {
                if (idx == val.length)
                    throw new Error(
                        `/{red}ecb/{white}: /{lightred}Invalid ECB String`,
                    )
                key += val[idx]
            }
            let value = ''
            while (val[idx++] != ';') {
                if (idx == val.length)
                    throw new Error(
                        `/{red}ecb/{white}: /{lightred}Invalid ECB String`,
                    )
                key += val[idx]
            }
            style[key] = value
        }
        // Push the color and the text, using the next color marker as an endpoint
        o.push({
            str: val.slice(idx + 1, cols[idx + 1]),
            style: {
                color: style?.c || style?.col || style?.color || style?.[''],
            },
        })
    }
    api.broadcastMessage(o)
}
