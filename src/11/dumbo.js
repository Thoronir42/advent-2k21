import { runTask, streamLines } from "../utils/ioUtils.js";
import { eachCell, eachNeighbor, setCell } from "../utils/vectorArrayUtils.js";

runTask(async function() {
    const octos = await loadOctopuses()
    this.reportPhase('io')
    const result = simulateOctos(octos, 1000)
    console.log(result);
})

async function loadOctopuses() {
    const octos = []
    await streamLines({meta: import.meta}, (line) => octos.push([...line].map(Number)))
    return octos
}

function printOctos(octos) {
    console.log(octos.map((row) => row.join('')).join('\n'));
}

function simulateOctos(octos, maxSteps) {
    let totalFlashes = 0
    let flashesAfter = {}
    const octosCount = octos.reduce((sum, row) => sum + row.length, 0)
    
    let step
    for (step = 1; step <= maxSteps; step++) {
        stepBumpPowerLevel(octos)
        stepSimulateFlashes(octos)
        const currentFlashes = collectFlashes(octos)
        totalFlashes += currentFlashes
        if (step === 100) {
            flashesAfter[100] = totalFlashes
        }
        if (currentFlashes === octosCount) {
            break
        }
    }

    return {
        flashesAfter,
        stepsToSync: step,
    }
}

const stepBumpPowerLevel = (octos) => eachCell(octos, (p, power) => setCell(power + 1, octos, p))
const stepSimulateFlashes = (octos) => {
    const toFlash = []
    let flashes = 0
    eachCell(octos, (p, power) => {
        if (power === 10) {
            toFlash.push(p)
            flashes++
        }
    })

    while (toFlash.length) {
        const pFlash = toFlash.shift()

        eachNeighbor.inter(octos, pFlash, (pNeighbor, value) => {
            const newValue = value + 1
            setCell(newValue, octos, pNeighbor)
            if (newValue === 10) {
                toFlash.push(pNeighbor)
                flashes++
            }
        })
    }

    return flashes
}
const collectFlashes = (octos) => {
    let flashed = 0
    eachCell(octos, (p, power) => {
        if (power >= 10) {
            setCell(0, octos, p)
            flashed++
        }
    })
    return flashed
}