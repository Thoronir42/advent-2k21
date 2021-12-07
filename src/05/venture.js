import { runTask, streamLines } from "../utils/ioUtils.js";

runTask(async function () {
    const lines = await loadLines()
    this.reportPhase('io')
    findOverlaps(lines)
    this.reportPhase('algo')
})

async function loadLines() {
    const lines = []
    
    const parseCoords = (coordsStr) => coordsStr.split(',').map((coordStr) => Number(coordStr.trim()))
    await streamLines({importMeta: import.meta}, (line) => {
        const coords = line.trim().split(' -> ').map(parseCoords)
        lines.push(coords)
    })

    return lines
}

function findOverlaps(lines) {
    const map = []
    

    function markPoint(p) {
        let slice = map
        let mapSlice, finalSlicePos

        p.reverse().forEach((pos, dim) => {
            if (dim === p.length - 1) {
                mapSlice = slice
                finalSlicePos = pos
                return
            }

            if (!slice[pos]) {
                slice[pos] = []
            }
            slice = slice[pos]
        })
        if (!mapSlice[finalSlicePos]) {
            mapSlice[finalSlicePos] = 0
        }
        mapSlice[finalSlicePos]++
    }

    lines
        // .filter(lineFollowsMainAxis)
        .forEach(([p1, p2]) => {
            walkLine(p1, p2, (p) => markPoint(p))
        })
    const overlaps = countOverlaps(map)
    console.log(overlaps);
    
}

function lineFollowsMainAxis(line) {
    return line[0].some((pos, dimension) => pos === line[1][dimension])
}
function walkLine(p1, p2, onPoint) {
    const d = p1.map((pos, dim) => p2[dim] - pos)
    const ds = d.map((dist) => Math.sign(dist))
    const dist = Math.max(...d.map(Math.abs))

    for (let i = 0; i <= dist; i++) {
        const p = p1.map((pos, dim) => pos + ds[dim] * i)
        onPoint(p)
    }

    return
}

function countOverlaps(map) {
    const rows = map.length
    const rowLengths = [...map.map((row) => row?.length || 0)].filter((l) => (l))
    const cols = Math.max(...rowLengths)

    let overlaps = 0
    for (let y = 0; y < rows; y++) {
        const row = map[y] || []

        // let rowStr = ''
        for (let x = 0; x < cols; x++) {
            const lineHits = row[x] || 0
            if (lineHits > 1) {
                overlaps++
            }
            // rowStr += lineHits || '.'
        }
        // console.log(rowStr);
    }

    return overlaps
}