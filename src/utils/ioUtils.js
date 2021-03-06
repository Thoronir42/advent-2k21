import path from "path"
import url from "url"
import readline from "readline"
import fs from "fs"
import { performance } from "perf_hooks"

/**
 * 
 * @param {string|object} input 
 * @returns {number[]}
 */
export async function loadLineOfNumbers(input) {
    let numbers
    await streamLines(input, (line) => {
        numbers = line.trim().split(',').map((n) => Number(n.trim()))
    })
    return numbers
}

/**
 * 
 * @param {string|object} input - absolute path to the file to be parsed
 * @param {function} onLine - callback to process the line
 * 
 * @returns {Promise<number>} - count of lines
 */
export async function streamLines(input, onLine) {
    const file = getFilePath(input)

    const parseContext = {
        lc: 0,
        dataBuffer: null,
    }

    await new Promise((resolve) => {
        const lineReader = readline.createInterface({
            input: fs.createReadStream(file),
        })
          
        lineReader.on('line', function (line) {
            parseContext.dataBuffer = onLine.call(parseContext, line, parseContext.lc++) ?? parseContext.dataBuffer
        })
        lineReader.on('close', () => resolve())
    })

    return parseContext
}

export function getFilePath(input) {
    if (typeof input === 'object') {
        const meta = input.importMeta || input.meta
        if (meta) {
            if (!input.file && process.argv[2]) {
                return path.resolve(process.cwd(), process.argv[2])
            }

            const dir = path.dirname(url.fileURLToPath(meta.url))
            return path.join(dir, input.file || 'input.txt')
        }
    }

    console.error("Invalid input file spec", input);
    process.exit(1)
}

export function runTask(callback) {
    const start = performance.now()
    const runContext = {
        reportPhase: (name) => {
            const duration = performance.now() - start

            console.log(`[${name}] duration: ${duration.toFixed(3)}ms`);
        }
    }

    Promise.resolve()
        .then(() => callback.call(runContext))
        .then((result) => {
            runContext.reportPhase('job')
            if (result !== undefined) {
                console.log('job result: ', result)
            }
        })
        .catch((e) => {
            runContext.reportPhase('err')
            console.error(e)
            process.exit(1)
        })
}