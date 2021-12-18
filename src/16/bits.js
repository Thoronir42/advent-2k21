import { createReadStream } from "fs";

import { runTask, getFilePath } from "../utils/ioUtils.js";
import * as streamUtils from "../utils/streamUtils.js"

runTask(async function() {
    const consumer = streamUtils.createBitStreamConsumer(createBitStream())
    const packet = await loadPacket(consumer)
    // console.log(JSON.stringify(packet, undefined, 2));

    const rest = (await consumer.readToEnd()).toString()
    console.log(rest);
    return {
        versionSum: sumPacketVersions(packet),
        packetValue: evaluatePacketValue(packet),
    }
})

function createBitStream() {
    const path = getFilePath({meta: import.meta})
    
    return createReadStream(path)
        .pipe(streamUtils.createHexToBinTransform())
}

async function loadPacket(consumer) {
    const packet = {
        ver: await consumer.readInt(3),
        typ: await consumer.readInt(3),
    }
    
    if (packet.typ === 4) {
        packet.val = await loadLiteralValue(consumer)
    } else {
        await loadOperatorPacket(consumer, packet)
    }

    return packet
}

async function loadLiteralValue(consumer) {
    const chunks = []
    let hasMore
    do {
        hasMore = await consumer.readInt(1)
        const chunk = await consumer.readBits(4)
        chunks.push(chunk)
    } while (hasMore)

    return Number.parseInt(chunks.join(''), 2)
}

const packetLenTypePopulators = {
    0: async function populateOperatorPacketSubLength(consumer, packet) {
        packet.len = await consumer.readInt(15)
        packet.val = []

        let start = consumer.position
        let readLength = start

        while (readLength - start < packet.len) {
            packet.val.push(await loadPacket(consumer))
            readLength = consumer.position
        }
    },
    1: async function populateOperatorPacketSubCount(consumer, packet) {
        packet.len = await consumer.readInt(11)
        packet.val = []

        for (let i = 0; i < packet.len; i++) {
            packet.val.push(await loadPacket(consumer))
        }
    },
}
async function loadOperatorPacket(consumer, packet) {
    packet.lenTyp = await consumer.readInt(1)
    await packetLenTypePopulators[packet.lenTyp](consumer, packet)
}

function sumPacketVersions(packet) {
    let sum = 0
    const toSum = [packet]

    while (toSum.length) {
        const currPacket = toSum.shift()
        sum += currPacket.ver
        if (currPacket.typ !== 4) {
            toSum.push(...currPacket.val)
        }
    }
    return sum
}

const getValueByType = {
    0: ({val}) => val.reduce((sum, packet) => sum + evaluatePacketValue(packet), 0),
    1: ({val}) => val.reduce((sum, packet) => sum * evaluatePacketValue(packet), 1),
    2: ({val}) => Math.min(...val.map((packet) => evaluatePacketValue(packet))),
    3: ({val}) => Math.max(...val.map((packet) => evaluatePacketValue(packet))),
    4: ({val}) => val,
    5: ({val}) => evaluatePacketValue(val[0]) > evaluatePacketValue(val[1]) ? 1 : 0,
    6: ({val}) => evaluatePacketValue(val[0]) < evaluatePacketValue(val[1]) ? 1 : 0,
    7: ({val}) => evaluatePacketValue(val[0]) === evaluatePacketValue(val[1]) ? 1 : 0,
}
function evaluatePacketValue(packet) {
    return getValueByType[packet.typ](packet)
}