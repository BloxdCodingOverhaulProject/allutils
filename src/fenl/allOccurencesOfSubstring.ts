/**
 * Finds all occurrences of a substring in a string
 *
 * @param {string} val - The string to search in
 * @param {string} substr - The substring to search for
 * @returns An array of all indices of the substring in the string
 */
export default function allOccurrencesOfSubstring(
    val: string,
    substr: string,
): number[] {
    let idx = val.indexOf(substr)
    let out = []
    while (idx != -1) {
        out.push(idx)
        idx = val.indexOf(substr, idx)
    }
    return out
}
