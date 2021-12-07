import { runTask, streamLines } from "../utils/ioUtils.js"

runTask(async function() {
    const fish = await loadFish()
    this.reportPhase('io')
    
    let fishCount = estimateLanternFish(fish, 80)
    this.reportPhase('algo pt1')
    console.log(fishCount)

    fishCount = estimateLanternFish(fish, 256)
    this.reportPhase('algo pt2')
    console.log(fishCount)
})

async function loadFish() {
    let fish
    await streamLines({meta: import.meta}, (line) => {
        fish = line.trim().split(',').map((n) => Number(n.trim()))
    })
    return fish
}

function estimateLanternFish(fish, duration) {
    const groups = [...Array.from({length: 9})].map(() => 0)
    fish.forEach((dtb, i) => {
        groups[dtb]++
    })

    for (let day = 0; day < duration; day++) {
        const b = groups.shift()
        groups.push(0)
        groups[6] += b
        groups[8] += b
    }

    return groups.reduce((sum, g) => sum += g, 0)
}

function simulateLanternfish(fish, duration) {
    const groups = [...Array.from({length: 9})].map(() => [])
    fish.forEach((dtb, i) => {
        groups[dtb].push(i)
    })
    let nextId = fish.length

    let tmp = []
    for (let day = 0; day < duration; day++) {
        const b = groups.shift()
        groups.push(tmp)

        b.forEach((id) => {
            groups[6].push(id)
            groups[8].push(nextId++)
        })
        b.splice(0)
        tmp = b

        // console.log(reconstructFish(groups).join(','));
    }

    return groups.reduce((sum, g) => sum += g.length, 0)
}

function reconstructFish(groups) {
    const fish = []
    groups.forEach((g, dtb) => {
        g.forEach((f) => fish[f] = dtb)
    })
    return fish
}