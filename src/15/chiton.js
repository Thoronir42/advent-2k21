import { runTask, streamLines } from "../utils/ioUtils.js";
import { eachNeighbor, getCell, setCell } from "../utils/vectorArrayUtils.js";

runTask(async function() {
    const riskMap = await loadRiskMap()
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