export function findLastIndex(array, predicate) {
    for (let index = array.length - 1; index >= 0; index--) {
        if (predicate(array[index], index)) {
            return index
        }
    }

    return -1
}

export function through(a, b, onValue) {
    let d = a - b
    const s = Math.sign(d)
    
    for (let i = a; (i - b) * s >= 0; i -= s) {
        onValue(i)
    }
}
