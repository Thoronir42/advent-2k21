import { runTask, streamLines } from "../utils/ioUtils.js";

runTask(async function() {
    const fish = await loadFish()
    this.reportPhase('io')
    const resultFish = simulateLanternfish(fish, 80)
    this.reportPhase('algo')

    console.log(resultFish.length);
})

async function loadFish() {
    let fish
    await streamLines({meta: import.meta}, (line) => {
        fish = line.trim().split(',').map((n) => Number(n.trim()))
    })
    return fish
}

function simulateLanternfish(fish, duration) {
    const fishWorkingCopy = fish.slice()
    const newFish = []

    for (let i = 0; i < duration; i++) {
        fishWorkingCopy.forEach((_, i) => {
            if (--fishWorkingCopy[i] < 0) {
                newFish.push(8)
                fishWorkingCopy[i] = 6
            }
        })

        fishWorkingCopy.push(...newFish.splice(0))
    }

    return fishWorkingCopy
}