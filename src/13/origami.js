import { runTask, streamLines } from "../utils/ioUtils.js";
import SparseArray from "../utils/sparseArray.js";
import {eachCell} from "../utils/vectorArrayUtils.js";

runTask(async function() {
    const {sheet, folds} = await loadInstructions()

    let foldedSheet = sheet
    folds.forEach((fold, i) => {
        foldedSheet = foldSheet(foldedSheet, fold)
    })

    const denseArray = foldedSheet.toDenseArray()
    console.log(denseArray.map((row) => row.map((value) => value ? 'X' : ' ').join('')).join('\n'));
    console.log(countNonZeroValues(denseArray));
})

async function loadInstructions() {
    const sheet = new SparseArray(2)
    const folds = []
    let loadMode = 'points'

    const foldSkip = 'fold along '.length
    const dimensions = ['x', 'y']
    const processLine = {
        points: (line) => {
            const point = line.split(',').map((p) => Number(p.trim()))
            sheet.push(point, 1)
        },
        folds: (line) => {
            const [dimension, offset] = line.slice(foldSkip).split('=')
            folds.push([dimensions.indexOf(dimension), Number(offset)])
        },
    }

    await streamLines({meta: import.meta}, (line) => {
        if (!line) {
            loadMode = 'folds'
            return
        }
        processLine[loadMode](line)
    })

    return {sheet, folds}
}

/**
 * 
 * @param {SparseArray} sheet 
 * @param {[number, number]} fold
 * 
 * @returns {SparseArray}
 */
function foldSheet(sheet, [dimension, offset]) {
    const foldedSheet = new SparseArray(sheet.dimensions)

    sheet.points.forEach(([point, value]) => {
        const resultPoint = point.slice()
        if (resultPoint[dimension] < offset) {
            foldedSheet.push(point, value)
            return
        }
        resultPoint[dimension] = offset * 2 - resultPoint[dimension]
        foldedSheet.push(resultPoint, value)
    })

    return foldedSheet
}

function countNonZeroValues(denseArray) {
    let sum = 0
    eachCell(denseArray, (p, value) => sum += value ? 1 : 0)
    return sum
}