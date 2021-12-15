import { runTask, streamLines } from "../utils/ioUtils.js";
import { createMap, eachCell, eachNeighbor, getCell, setCell } from "../utils/vectorArrayUtils.js";

runTask(async function() {
    let riskMap = await loadRiskMap()
    riskMap = expandMap(riskMap, 5)

    // console.log(riskMap.map((row) => row.join('')).join('\n'));
    // return
    const totalRiskMap = evaluateRisk(riskMap)
    // console.log(totalRiskMap.map((row) => row.join('\t')).join('\n'));

    const row = totalRiskMap[totalRiskMap.length - 1]
    const endTotalRisk = row[row.length - 1]
    console.log(endTotalRisk[0]);
})

async function loadRiskMap() {
    const map = []
    await streamLines({meta: import.meta}, (line) => {
        map.push([...line].map((p) => Number(p)))
    })
    return map
}
function expandMap(map, times) {
    const mapDimensions = [map.length, map[0].length]
    const chunks = createMap([times, times], (chunkCoords) => createMap(mapDimensions, (coords) => {
        const risk = getCell(map, coords)
        const newValue = (risk + chunkCoords[0] + chunkCoords[1] - 1) % 9 + 1
        return newValue
    }))

    
    const newMap = createMap(mapDimensions.map((size) => (size * times)), (coords) => {
        const chunkCoords = coords.map((offset, iDim) => Math.floor(offset / mapDimensions[iDim]))
        const subCoords = coords.map((offset, iDim) => offset % mapDimensions[iDim])

        const chunk = getCell(chunks, chunkCoords)
        return getCell(chunk, subCoords)
    })

    return newMap
}

function evaluateRisk(riskMap) {
    const totalRiskMap = riskMap.map((row) => Array.from({length: row.length}))
    setCell([0, 'start'], totalRiskMap, [0, 0])

    const toWalk = [[0, 0]]

    while (toWalk.length) {
        const activePoint = toWalk.shift()
        const totalRiskEntry = getCell(totalRiskMap, activePoint)
        const [activePointRisk] = totalRiskEntry

        eachNeighbor(riskMap, activePoint, (neighborPoint, risk, dir) => {
            const newRisk = activePointRisk + risk
            const [currentRisk] = getCell(totalRiskMap, neighborPoint) ?? []
            if (currentRisk === undefined || newRisk < currentRisk) {
                setCell([newRisk, dir], totalRiskMap, neighborPoint)
                toWalk.push(neighborPoint)
            }
        })
    }

    return totalRiskMap
}