export function findLastIndex(array, predicate) {
    for (let index = array.length - 1; index >= 0; index--) {
        if (predicate(array[index], index)) {
            return index
        }
    }

    return -1
}