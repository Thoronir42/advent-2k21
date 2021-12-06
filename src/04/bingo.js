import { runTask, streamLines } from "../utils/ioUtils.js";

runTask(async () => {
    const bingoData = {
        boardDimensions: {w:5, h:5},
        get boardTileCount() {
            return bingoData.boardDimensions.w * bingoData.boardDimensions.h
        },

        drawing: null,
        boards: [],
    }

    Object.assign(bingoData, await loadInput(bingoData.boardTileCount))
    bingoData.marks = new WeakMap()
    bingoData.boards.forEach((board) => bingoData.marks.set(board, []))

    const winningDraw = drawWinner(bingoData)
    const {board, num} = winningDraw
    const marks = bingoData.marks.get(board)

    const sumUnmarked = board.reduce((sum, n, i) => sum + (marks[i] ? 0 : n), 0)
    console.log(sumUnmarked * num);
})

async function loadInput(boardTileCount) {
    let drawing = null
    const boards = []

    function flushBoard(buffer) {
        if (!buffer.board.length) {
            return
        }
        
        if (buffer.board.length !== boardTileCount) {
            console.error(`[${i}] Wrong bingo board length: ` + JSON.stringify(buffer.board));
        } else {
            boards.push(buffer.board.slice())
        }
        buffer.board.splice(0)
    }

    let parseContext = await streamLines({importMeta: import.meta}, function(line, i) {
        if (i === 0) {
            drawing = line.split(',').map((n) => Number.parseInt(n.trim()))
            return
        }

        if (!this.dataBuffer) {
            this.dataBuffer = {
                board: [],
            }
        }

        if (!line) {
            flushBoard(this.dataBuffer)
            return
        }

        const boardLineNumbers = line.trim().split(/\s+/).map(Number)
        this.dataBuffer.board.push(...boardLineNumbers)
    })
    flushBoard(parseContext.dataBuffer)
    parseContext = null

    return {drawing, boards}
}

/**
 * 
 * @param {object} bingoData 
 * @param {WeakMap} bingoData.marks
 */
function drawWinner(bingoData) {
    const numberSubscribers = []

    bingoData.boards.forEach((board, iBoard) => {
        board.forEach((n, iNumber) => {
            if (!numberSubscribers[n]) {
                numberSubscribers[n] = []
            }
            numberSubscribers[n].push([iBoard, iNumber])
        })
    })

    for (const num of bingoData.drawing) {
        const subscribers = numberSubscribers[num] || []

        const winner = subscribers.find(([iBoard, iNumber]) => {
            const board = bingoData.boards[iBoard]
            const marks = bingoData.marks.get(board)
            marks[iNumber] = true

            return checkVictor(marks, iNumber)
        })

        if (winner) {
            const board = bingoData.boards[winner[0]]
            return {board, num}
        }
    }

    function checkVictor(marks, iNumber) {
        const x = iNumber % bingoData.boardDimensions.w
        const y = Math.floor(iNumber / bingoData.boardDimensions.w)

        return isFullRow(marks, y) || isFullCol(marks, x)
    }
    function isFullRow(marks, y) {
        let allSet = true
        for (let x = 0; x < bingoData.boardDimensions.w; x++) {
            const isSet = marks[y * bingoData.boardDimensions.w + x]
            allSet = allSet && isSet
        }
        return allSet
    }
    function isFullCol(marks, x) {
        let allSet = true
        for (let y = 0; y < bingoData.boardDimensions.h; y++) {
            const isSet = marks[y * bingoData.boardDimensions.w + x]
            allSet = allSet && isSet
        }
        return allSet
    }

    console.error("No winner")
    process.exit(2)
}