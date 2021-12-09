import { runTask, streamLines } from "../utils/ioUtils.js";

runTask(async function () {
    let outSum = 0
    await streamLines({meta: import.meta}, (line, lc) => {
        const [scanInput, output] = line
            .split('|').map((s) => s.trim())
            .map((s) => s.split(' ').map((cipher) => [...cipher].sort().join('')))

        const cipherKey = createCipherKey(groupInputsByLength(scanInput))
        const outNumbers = output.map((cipher) => cipherKey[cipher])
        outSum += Number(outNumbers.join(''))
    })

    console.log(outSum);
})

function groupInputsByLength(inputs) {
    return inputs.reduce((index, input) => {
        if (!index[input.length]) {
            index[input.length] = []
        }
        index[input.length].push(input)
        return index
    }, {})
}

function createCipherKey(inputsByLength) {
    const cipherKey = {
        1: inputsByLength[2][0],
        7: inputsByLength[3][0],
        4: inputsByLength[4][0],
        8: inputsByLength[7][0],
    }
    const halfFour = segOp.subtract(cipherKey[4], cipherKey[1])

    cipherKey[3] = inputsByLength[5].filter((cipher) => segOp.multiply(cipher, cipherKey[1]).length === 2)
    cipherKey[5] = inputsByLength[5].filter((cipher) => segOp.multiply(cipher, halfFour).length === 2)
    cipherKey[2] = inputsByLength[5].filter((cipher) => cipher !== cipherKey[3][0] && cipher !== cipherKey[5][0])

    cipherKey[6] = inputsByLength[6].filter((cipher) => segOp.multiply(cipher, halfFour).length === 2 && segOp.multiply(cipher, cipherKey[7]).length === 2)
    cipherKey[9] = inputsByLength[6].filter((cipher) => segOp.multiply(cipher, halfFour).length === 2 && segOp.multiply(cipher, cipherKey[7]).length === 3)
    cipherKey[0] = inputsByLength[6].filter((cipher) => cipher !== cipherKey[6][0] && cipher !== cipherKey[9][0])
    
    return Object.fromEntries(Object.entries(cipherKey).map(([num, cipher]) => [cipher, Number(num)]))
}
const segOp = {
    subtract: (a, b) => [...a].filter((seg) => !b.includes(seg)).join(''),
    multiply: (a, b) => [...a].filter((seg) => b.includes(seg)).join(''),
}