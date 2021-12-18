import { createReadStream } from "fs";

import { runTask, getFilePath } from "../utils/ioUtils.js";
import * as streamUtils from "../utils/streamUtils.js"

runTask(async function() {
    const consumer = streamUtils.createBitStreamConsumer(createBitStream())
    const packet = await loadPacket(consumer)
    // console.log(JSON.stringify(packet, undefined, 2));

    const rest = (await consumer.readToEnd()).toString()
    console.log(rest);
    console.log(sumPacketVersions(packet));
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
        packet.packets = []

        let start = consumer.position
        let readLength = start

        while (readLength - start < packet.len) {
            packet.packets.push(await loadPacket(consumer))
            readLength = consumer.position
        }
    },
    1: async function populateOperatorPacketSubCount(consumer, packet) {
        packet.len = await consumer.readInt(11)
        packet.packets = []

        for (let i = 0; i < packet.len; i++) {
            packet.packets.push(await loadPacket(consumer))
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
        if (currPacket.packets) {
            toSum.push(...currPacket.packets)
        }
    }
    return sum
}