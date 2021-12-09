import { runTask, streamLines } from "../utils/ioUtils.js";

const directions = {
    N: {x: 0, y: -1},
    E: {x: 1, y: 0},
    S: {x: 0, y: 1},
    W: {x: -1, y: 0},
}

runTask(async function () {
    const heightMap = await loadHeightMap()
    this.reportPhase('io')
    const lowPoints = findLowPoints(heightMap)
    console.log(lowPoints.reduce((sum, p) => sum + p.h + 1, 0));
})

async function loadHeightMap() {
    const map = []
    await streamLines({meta: import.meta}, (line) => {
        map.push([...line].map(Number))
    })
    return map
}

function findLowPoints(heightMap) {
    const neighbors = heightMap.map((row) => row.map(() => 0))
    eachPoint(heightMap, (x, y, height) => {
        const dir = getDirectionToLowestNeighbor(heightMap, x, y)
        const dirV = directions[dir]
        if (getHeight(heightMap, x + dirV.x, y + dirV.y) <= height) {
            neighbors[y][x] = dir
        }
    })

    const lowPoints = []
    eachPoint(neighbors, (x, y, dir) => {
        if (dir === 0) {
            lowPoints.push(({x, y, h: getHeight(heightMap, x, y)}))
        }
    })
    return lowPoints

}

function eachPoint(map, onPoint) {
    for(let y = 0; y < map.length; y++) {
        const row = map[y]
        for (let x = 0; x < row.length; x++) {
            onPoint(x, y, row[x])
        }
    }
}
function getHeight(map, x, y) {
    if (y < 0 || y >= map.length) {
        return
    }
    const row = map[y]
    if (x < 0 || x >= row.length) {
        return
    }
    return row[x]
}
function getDirectionToLowestNeighbor(map, x, y) {
    let minDir, minHeight
    Object.entries(directions).forEach(([dir, d]) => {
        const height = getHeight(map, x + d.x, y + d.y)
        if (typeof height !== 'number') {
            return
        }
        
        if (!minDir || height < minHeight) {
            minDir = dir
            minHeight = height
        }
    })
    
    return minDir
}