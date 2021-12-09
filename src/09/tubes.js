import { runTask, streamLines } from "../utils/ioUtils.js";

const directions = {
    N: [0, -1],
    E: [1, 0],
    S: [0, 1],
    W: [-1, 0],
}

runTask(async function () {
    const heightMap = await loadHeightMap()
    this.reportPhase('io')
    const neighbors = mapNeighbors(heightMap)
    const lowPoints = findLowPoints(heightMap, neighbors)
    console.log(lowPoints.reduce((sum, p) => sum + p.h + 1, 0));
    
    const basinSizes = findBasins(heightMap, neighbors)
    const result = Object.values(basinSizes)
        .sort((a, b) => -(a - b))
        .filter((n, i) => i < 3)
        .reduce((product, n) => product * n, 1)
    console.log(result);
})

async function loadHeightMap() {
    const map = []
    await streamLines({meta: import.meta}, (line) => {
        map.push([...line].map(Number))
    })
    return map
}

function mapNeighbors(heightMap) {
    const neighbors = heightMap.map((row) => row.map(() => 0))
    eachCell(heightMap, (p, height) => {
        const dir = getDirectionToLowestNeighbor(heightMap, p)
        const p1 = pAdd(p, directions[dir])
        if (getCell(heightMap, p1) <= height) {
            setCell(dir, neighbors, p)
        }
    })
    return neighbors
}
function findLowPoints(heightMap, neighbors) {
    const lowPoints = []
    eachCell(neighbors, (p, dir) => {
        if (dir === 0) {
            lowPoints.push(({p, h: getCell(heightMap, p)}))
        }
    })
    return lowPoints
}
function findBasins(heightMap) {
    const basins = heightMap.map((row) => row.map(() => 0))
    
    let nextBasin = 1
    const basinSizes = {}
    const counted = {}
    eachCell(heightMap, (p, height) => {
        if (getCell(basins, p) || height === 9) {
            return
        }
        basinSizes[nextBasin] = paintBasin(heightMap, basins, nextBasin, p)
        nextBasin++
    })

    return basinSizes
}
function paintBasin(heightMap, basins, iBasin, p) {
    const toPaint = [p]

    let painted = 0
    while (toPaint.length) {
        const currentPoint = toPaint.shift()
        if (getCell(basins, currentPoint)) {
            continue
        }

        setCell(iBasin, basins, currentPoint)
        painted++

        eachNeighbor(heightMap, currentPoint, (pn, height) => {
            if (height === 9 || getCell(basins, pn)) {
                return
            }
            toPaint.push(pn)
        })
    }

    return painted
}

function eachCell(map, onPoint) {
    for(let y = 0; y < map.length; y++) {
        const row = map[y]
        for (let x = 0; x < row.length; x++) {
            onPoint([x, y], row[x])
        }
    }
}
function getCell(map, p) {
    if (!pInMap(map, p)) {
        return
    }
    return map[p[1]][p[0]]
}
function setCell(value, map, p) {
    if (!pInMap(map, p)) {
        return
    }
    map[p[1]][p[0]] = value
}
function pInMap(map, p) {
    if (p[1] < 0 || p[1] >= map.length) {
        return false
    }
    const row = map[p[1]]
    if (p[0] < 0 || p[0] >= row.length) {
        return false
    }

    return true
}
function pAdd(p1, p2) {
    return p1.map((l, i) => l + p2[i])
}
function eachNeighbor(map, p, onPoint) {
    Object.entries(directions).forEach(([dir, d]) => {
        const p1 = pAdd(p, d)
        if (pInMap(map, p1)) {
            onPoint(p1, getCell(map, p1), dir)
        }
    })
}

function getDirectionToLowestNeighbor(map, p) {
    let minDir, minHeight
    eachNeighbor(map, p, (p, height, dir) => {
        if (!minDir || height < minHeight) {
            minDir = dir
            minHeight = height
        }
    })
    
    return minDir
}