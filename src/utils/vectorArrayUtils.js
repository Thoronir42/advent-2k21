export const cardinalDirections = {
    N: [0, -1],
    E: [1, 0],
    S: [0, 1],
    W: [-1, 0],
}
export const interCardinalDirections = {
    N: [0, -1],
    NE: [1, -1],
    E: [1, 0],
    SE: [1, 1],
    S: [0, 1],
    SW: [-1, 1],
    W: [-1, 0],
    NW: [-1, -1],
}


export function eachCell(map, onPoint) {
    for(let y = 0; y < map.length; y++) {
        const row = map[y]
        for (let x = 0; x < row.length; x++) {
            onPoint([x, y], row[x])
        }
    }
}
export function getCell(map, p) {
    if (!pInMap(map, p)) {
        return
    }
    return map[p[1]][p[0]]
}
export function setCell(value, map, p) {
    if (!pInMap(map, p)) {
        return
    }
    map[p[1]][p[0]] = value
}
export function pInMap(map, p) {
    if (p[1] < 0 || p[1] >= map.length) {
        return false
    }
    const row = map[p[1]]
    if (p[0] < 0 || p[0] >= row.length) {
        return false
    }

    return true
}

export function createMap(dimensions, createEl) {
    return Array.from({length: dimensions[1]})
        .map((r, y) => {
            const row = Array.from({length: dimensions[0]})
            if (!createEl) {
                return row
            }
            return row.map((c, x) => createEl([y, x]))
        })
}

export function eachNeighbor(map, p, onPoint) {
    Object.entries(cardinalDirections).forEach(([dir, d]) => {
        const p1 = pAdd(p, d)
        if (pInMap(map, p1)) {
            onPoint(p1, getCell(map, p1), dir)
        }
    })
}
eachNeighbor.inter = function eachInterCardinalNeighbor(map, p, onPoint) {
    Object.entries(interCardinalDirections).forEach(([dir, d]) => {
        const p1 = pAdd(p, d)
        if (pInMap(map, p1)) {
            onPoint(p1, getCell(map, p1), dir)
        }
    })
}

export function pAdd(p1, p2) {
    return p1.map((l, i) => l + p2[i])
}