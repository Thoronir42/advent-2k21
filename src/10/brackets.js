import { runTask, streamLines } from "../utils/ioUtils.js";

const chunkDelimiters = [
    {chars: '()', score: 3},
    {chars: '[]', score: 57},
    {chars: '{}', score: 1197},
    {chars: '<>', score: 25137},
]
const charActions = {}
chunkDelimiters.forEach((delimiter, i) => {
    charActions[delimiter.chars.charAt(0)] = {action: 'open', type: i}
    charActions[delimiter.chars.charAt(1)] = {action: 'close', type: i}
})


runTask(async () => {
    let invalidScore = 0
    let unclosedScores = []
    
    await streamLines({meta: import.meta}, (line, i) => {
        const lineResult = analyzeLine(line)
        if (lineResult.status === 'error') {
            const illegalDelimiter = chunkDelimiters[lineResult.actualType]
            invalidScore += illegalDelimiter.score
        }
        if (lineResult.status === 'unclosed') {
            // console.log(lineResult.rest.map((i) => chunkDelimiters[i].chars.charAt(1)).join(''));
            unclosedScores.push(evalUnclosedChunks(lineResult.rest))
        }
    })

    unclosedScores.sort((a, b) => a - b)
    const midScoreIndex = Math.floor(unclosedScores.length / 2)
    console.log('illegal: ' + invalidScore);
    console.log(`unclosed[${midScoreIndex}/${unclosedScores.length-1}]: `, unclosedScores[midScoreIndex]);
})

function analyzeLine(line) {
    const chunkCtx = {
        stack: [],
        last() {
            return this.stack[0]
        },
        open(action) {
            this.stack.unshift(action.type)
        },
        close(action) {
            if (this.last() !== action.type) {
                return {status: 'error', expectedType: this.last(), actualType: action.type}
            }
            this.stack.shift()
        },
    };

    for (let i in line) {
        const char = line.charAt(i)
        const action = charActions[char]
        const result = chunkCtx[action.action](action)
        if (result?.status === 'error') {
            return result
        }
    }
    if (chunkCtx.stack.length) {
        return {status: 'unclosed', rest: chunkCtx.stack}
    }
    return {status: 'full'}
}

function evalUnclosedChunks(rest) {
    let sum = 0
    rest.forEach((type) => {
        sum *= 5
        sum += type + 1
    })
    return sum
}