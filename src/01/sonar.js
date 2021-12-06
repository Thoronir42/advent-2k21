import readline from'readline'
import fs from 'fs'
import path from 'path'
import url from 'url'

/**
 * @param {string} file 
 * @returns {Promise<number[]>}
 */
export function loadMeasures(file) {
    return new Promise((resolve) => {
        const measures = []

        const lineReader = readline.createInterface({
            input: fs.createReadStream(file),
          });
          
        lineReader.on('line', function (line) {
            const n = Number.parseInt(line)
            measures.push(n)
        });
        lineReader.on('close', () => resolve(measures))
    })
}

/**
 * @param {number[]} measures 
 * @param {number} windowSize
 */
export function analyzeDepths(measures, windowSize) {
    const moves = {
        decrease: [],
        remain: [],
        increase: [],
    }

    const window = measures.slice(0, windowSize - 1)
    const readWindow = () => window.reduce((sum, measure) => sum + measure, 0)
    let lastReading = readWindow()

    for (let i = windowSize; i < measures.length; i++) {
        window.push(measures[i])
        const reading = readWindow()
        if (reading === lastReading) {
            moves.remain.push(i)
        } else if (reading > lastReading) {
            moves.increase.push(i)
        } else {
            moves.decrease.push(i)
        }
        lastReading = reading
        window.splice(0, 1)
    }

    return moves
}

export function printResult(moves) {
    const result = Object.entries(moves)
        .map(([moveType, moves]) => `${moveType}=${moves.length}`)
        .join('\n')
    console.log(result);
}

export async function executeTask() {
    const dir = path.dirname(url.fileURLToPath(import.meta.url))
    const file = path.join(dir, 'input.txt')

    const measures = await loadMeasures(file)
    const depthMoves = analyzeDepths(measures, 3)
    printResult(depthMoves)
}

executeTask()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })