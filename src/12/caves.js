import { createGraph, enumerateAllPaths } from "../utils/graphUtils.js";
import { runTask, streamLines } from "../utils/ioUtils.js";

runTask(async function() {
    const caveGraph = await loadCaveGraph()

    const paths = enumerateAllPaths(caveGraph, 'start', 'end', (path, nodeTo) => {
        return nodeTo.size === 'lg' || !path.includes(nodeTo.name)
    })
    console.log(paths.length);
    

    const paths2 = enumerateAllPaths(caveGraph, 'start', 'end', (path, nodeTo, nodeFrom) => {
        if (nodeTo.name === 'start' || nodeFrom.name === 'end') {
            return false
        }
        if (nodeTo.size === 'lg' || !path.includes(nodeTo.name)) {
            return true
        }

        const visitCounts = path.reduce((visitCounts, name) => {
            visitCounts[name] = (visitCounts[name] ?? 0) + 1
            return visitCounts
        }, {})
        const smallCaveMultiVisits = Object.entries(visitCounts)
            .filter(([name, count]) => count >= 2 && caveGraph.nodes[name].size === 'sm')
        return !smallCaveMultiVisits.length
    })
    console.log(paths2.length);
})

async function loadCaveGraph() {
    const graph = createGraph({
        createNode: (name) => ({
            name,
            size: name.toUpperCase() === name ? 'lg' : 'sm',
        }),
    })

    await streamLines({meta: import.meta}, (line) => {
        const [a, b] = line.split('-').map((name) => name.trim())
        graph.addEdge(a, b, true)
    })

    return graph
}

const stringifyPath = (path) => path.join(',')