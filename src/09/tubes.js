import { runTask, streamLines } from "../utils/ioUtils.js";
import { cardinalDirections, eachCell, eachNeighbor, getCell, pAdd, setCell } from "../utils/vectorArrayUtils.js";


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
        const p1 = pAdd(p, cardinalDirections[dir])
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