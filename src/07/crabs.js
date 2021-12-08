import { loadLineOfNumbers, runTask } from "../utils/ioUtils.js"

runTask(async function() {
    const crabs = await loadLineOfNumbers({meta: import.meta})
    this.reportPhase('io')

    const {pos, totalFuelCost} = evaluateCrabMoves(crabs)

    console.log(`${pos}:${totalFuelCost}`);
})

// There should be mathematical way for this problem
function evaluateCrabMoves(crabs) {
    const min = Math.min(...crabs)
    const max = Math.max(...crabs)
    
    const costs = [...Array.from({length: max})]
    for (let p = min; p <= max; p++) {
        costs[p] = getTotalFuelCost(p, crabs)
    }
    const totalFuelCost = Math.min(...costs)
    const pos = costs.indexOf(totalFuelCost)

    return {pos, totalFuelCost}
}

function getTotalFuelCost(pos, crabs) {
    const distances = crabs
        .map((crabPos) => Math.abs(crabPos - pos))
    return distances
        .reduce((sum, distance) => sum + distance, 0)
}