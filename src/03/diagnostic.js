import readline from'readline'
import fs from 'fs'
import path from 'path'
import url from 'url'

async function streamReadings(file, onCommand) {
    return new Promise((resolve) => {
        let lc = 0
        const lineReader = readline.createInterface({
            input: fs.createReadStream(file),
        })
          
        lineReader.on('line', function (line) {
            const digits = [...line]
                .map((char) => Number.parseInt(char))
            onCommand(digits)
        })
        lineReader.on('close', () => resolve(lc))
    })
}

export async function executeTask() {
    const dir = path.dirname(url.fileURLToPath(import.meta.url))
    const file = path.join(dir, 'input.txt')

    const digitCounts = []

    await streamReadings(file, (readingDigits) => {
        // This could be optimized out of every call if we could assume the reading length beforehead
        for (let position = 0; position < readingDigits.length; position++) {
            if (!digitCounts[position]) {
                digitCounts[position] = []
            }
        }
        
        readingDigits.forEach((digit, position) => {
            const positionCounts = digitCounts[position]
            if (typeof positionCounts[digit] !== "number") {
                positionCounts[digit] = 0
            }
            positionCounts[digit]++
        })
    })

    const gammaRate = constructNumber(digitCounts, Math.max)
    const epsilonRate = constructNumber(digitCounts, Math.min)

    const gammaRateDec = Number.parseInt(gammaRate, 2)
    const epsilonRateDec = Number.parseInt(epsilonRate, 2)

    console.log(gammaRateDec * epsilonRateDec);
}

function constructNumber(digitCounts, charSelector) {
    const digits = digitCounts.map((counts) => {
        const char = charSelector(...counts)
        const i = counts.indexOf(char)
        return i
    })

    return digits.join('')
}

executeTask()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
