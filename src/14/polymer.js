import { runTask, streamLines } from "../utils/ioUtils.js";
import LineParser from "../utils/LineParser.js";

runTask(async function() {
    const {chain, insertionRules} = await loadPolymerization()
    const ctrl = polyMem

    const result = ctrl.unfoldPolymer(chain, insertionRules, 10)
    const stats = ctrl.analyzePolymer(result)
    console.log(stats.extremes.top[1]  - stats.extremes.low[1]);
})

async function loadPolymerization() {
    let chain
    let insertionRules = {}

    const parser = new LineParser({
        chain: (line) => {
            if (!line) {
                return 'rules'
            }
            chain = line
        },
        rules: (line) => {
            const [pair, insert] = line.split('->').map((s) => s.trim())
            insertionRules[pair] = insert
        },
    }, 'chain')

    await streamLines({meta: import.meta}, (line) => parser.processLine(line))

    return {chain, insertionRules}
}

const polyMem = {
    unfoldPolymer(chain, insertionRules, steps) {
        let result = chain
        for (let i = 1; i <= steps; i++) {
            result = this._unfoldPolymerStep(result, insertionRules)
        }
        return result
    },
    _unfoldPolymerStep(chain, insertionRules) {
        for (let i = chain.length - 2; i >= 0; i--) {
            const pair = chain.substr(i, 2)
            const insertion = insertionRules[pair]
            if (insertion) {
                chain = chain.substr(0, i + 1) + insertion + chain.substr(i + 1)
            }
        }
    
        return chain
    },

    analyzePolymer(chain) {
        const counts = {}
        for (let i = 0; i < chain.length; i++) {
            const c = chain.charAt(i)
            counts[c] = (counts[c] ?? 0) + 1
        }
    
        const countEntries = Object.entries(counts)
        countEntries.sort((a, b) => b[1] - a[1])
        const top = countEntries[0]
        const low = countEntries[countEntries.length - 1]
    
        return {
            countsOrdered: countEntries,
            extremes: {top, low},
        }
    }
}