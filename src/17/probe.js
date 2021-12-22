import { through } from "../utils/arrayUtils.js";
import { runTask, streamLines } from "../utils/ioUtils.js";
import { withinRange } from "../utils/vectorUtils.js";

const dimensions = ['x', 'y']
const dimensionVelocityDelta = [
    (v) => -Math.sign(v),
    () => -1,
]

runTask(async function() {
    const targetArea = await loadTargetArea()
    const result = findInitVelocityOptions(targetArea)


    // let sampleOut = []
    // await streamLines({meta: import.meta, file: 'sample.out.txt'}, (line) => {
    //     line.split((/\s+/)).forEach((sample) => sampleOut.push(sample))
    // })
    // const myOut = result.map(({v}) => v.join(','))
    // sampleOut.sort()
    // myOut.sort()
    // myOut.forEach((str, i) => console.log(`${str}\t${sampleOut[i]}`))

    return {
        maxY: findHighestPoint(Math.max(...result.map(({v}) => v[1]))),
        combinations: result.length,
    }
})

async function loadTargetArea() {
    let area
    await streamLines({meta: import.meta}, (line) => {
        area = line.substring('target area:'.length)
            .split(',')
            .map((s) => s.trim())
            .map((def) => {
                const [dim, rangeStr] = def.split('=')
                const range = rangeStr.split('..').map((s) => Number(s))
                return [dim, range]
            })
            .reduce((area, [dim, range]) => {
                area[dimensions.indexOf(dim)] = range
                return area
            }, [])
    })

    return area
}

function findInitVelocityOptions(targetArea) {
    let options = []

    const verticalVelocityOptions = findVerticalVelocityOptions(targetArea[1])
    const maxStep = Math.max(...verticalVelocityOptions.keys())
    const horizontalVelocityOptions = findHorizontalVelocityOptions(targetArea[0], maxStep)

    Array.from(verticalVelocityOptions.entries()).forEach(([step, ivListVertical]) => {
        const ivListHorizontal = horizontalVelocityOptions.get(step)
        if (!ivListHorizontal) {
            return
        }
        ivListVertical.forEach((y) => {
            ivListHorizontal.forEach((x) => {
                const existing = options.find(({v}) => v[0] === x && v[1] === y)
                if (existing) {
                    existing.steps.push(step)
                    return
                }
                
                options.push({v: [x, y], steps: [step]})
            })
        })
    })

    return options
}
function findHorizontalVelocityOptions(range, maxStep) {
    const stepToValidInitialVelocityMap = new Map()

    const sign = Math.sign(range[1] - range[0])

    for (let iv of through.gen(range[1], 0)) {
        let velocity = iv
        let position = 0

        for (let step = 1; step <= maxStep && position <= range[1]; step++) {
            position += velocity
            velocity += dimensionVelocityDelta[0](velocity, sign)
            if (!withinRange(position, range)) {
                continue
            }
            if (!stepToValidInitialVelocityMap.has(step)) {
                stepToValidInitialVelocityMap.set(step, [])
            }
            stepToValidInitialVelocityMap.get(step).push(iv)
        }
    }

    return stepToValidInitialVelocityMap
}

function findVerticalVelocityOptions(range) {
    const stepToValidInitialVelocityMap = new Map()

    through(Math.abs(range[0]), range[0], (iv) => {
        const stepsInArea = findStepsInAreaVertical(range, iv, dimensionVelocityDelta[1])
        stepsInArea.forEach((step) => {
            if (!stepToValidInitialVelocityMap.has(step)) {
                stepToValidInitialVelocityMap.set(step, [])
            }
            stepToValidInitialVelocityMap.get(step).push(iv)
        })
    })

    return stepToValidInitialVelocityMap
}
function findStepsInAreaVertical(range, initialVelocity, velocityDeltaFn) {
    const steps = []
    
    let position = 0
    let velocity = initialVelocity
    let step = 0

    while (position >= range[0] || velocity > 0) {
        if (withinRange(position, range)) {
            steps.push(step)
        }

        position += velocity
        velocity += velocityDeltaFn(velocity)
        
        step++
    }

    return steps
}

function findHighestPoint(velocity) {
    let position = 0
    while (velocity > 0) {
        position += velocity
        velocity += dimensionVelocityDelta[1](velocity)
    }
    return position
}