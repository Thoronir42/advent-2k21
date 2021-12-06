import readline from'readline'
import fs from 'fs'
import path from 'path'
import url from 'url'

import {findLastIndex} from "../utils/arrayUtils.js"

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
    const file = path.join(dir, process.argv[2] ?? 'input.txt')

    // const digitCounts = []
    const readings = []

    await streamReadings(file, (readingDigits) => {
        readings.push(readingDigits)
        // collectCounts(digitCounts, readingDigits)
    })

    // printPowerConsumption(digitCounts)
    evaluateLifeSupprt(readings)
}

function collectCounts(digitCounts, readingDigits) {
    // This could be optimized out of every call if we could assume the reading length beforehead
    for (let position = 0; position < readingDigits.length; position++) {
        if (!digitCounts[position]) {
            digitCounts[position] = [0, 0]
        }
    }
    
    readingDigits.forEach((digit, position) => digitCounts[position][digit]++)
}

function printPowerConsumption(digitCounts) {
    const gammaRate = constructNumber(digitCounts, Math.max)
    const epsilonRate = constructNumber(digitCounts, Math.min)

    const gammaRateDec = Number.parseInt(gammaRate, 2)
    const epsilonRateDec = Number.parseInt(epsilonRate, 2)

    console.log(gammaRateDec * epsilonRateDec);
}

function evaluateLifeSupprt(readings) {
    const o2 = evaluateLifeSupprtProperty(readings, Math.max, 1)
    const co2 = evaluateLifeSupprtProperty(readings, Math.min, 0)
    
    const o2dec = Number.parseInt(o2, 2)
    const co2dec = Number.parseInt(co2, 2)

    console.log(o2dec * co2dec);
}

function evaluateLifeSupprtProperty(readings, charSelector, equalityPreference) {
    const digitCounts = []
    collectCounts(digitCounts, readings[0])
    for (let position = 0; position < digitCounts.length && readings.length > 1; position++) {
        digitCounts.splice(0)
        readings.forEach((readingDigits) => collectCounts(digitCounts, readingDigits))


        const topCount = digitCounts[position][0] === digitCounts[position[1]] ? equalityPreference
            : charSelector(...digitCounts[position])
        const topDigit = equalityPreference ? findLastIndex(digitCounts[position], (n) => n === topCount) : digitCounts[position].indexOf(topCount)

        console.log({
            position, digitCounts,
            topDigit, topCount,
        });

        readings = readings.filter((readingDigits) => {
            return readingDigits[position] === topDigit
        })
    }

    const finalReading = readings[0]
    return finalReading.join('')
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
