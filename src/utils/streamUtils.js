import { Transform } from "stream";

export function createHexToBinTransform() {
    return new Transform({
        transform(chunk, encoding, cb) {
            for (const byte of chunk) {
                const char = String.fromCharCode(byte)
                const bits = Number.parseInt(char, 16).toString(2).padStart(4, '0')
                this.push(bits)
            }
            
            cb()
        },
    })
}

/**
* @param {Transform} bitStream 
* @returns 
*/
export function createBitStreamConsumer(bitStream) {
    return {
        get position() {
            if (!this.inMemoryReader) {
                return -1
            }
            return this.inMemoryReader.processed
        },
        async read(targetLength) {
            if (!this.inMemoryReader) {
                this.inMemoryReader = await InMemoryReader.drain(bitStream)
            }
            return this.inMemoryReader.read(targetLength) 
        },
        // async read(targetLength) {
        //     if (targetLength < 0) {
        //         return Promise.reject(new Error('Invalid length'))
        //     }

        //     return new Promise((resolve, reject) => {
        //         let content = ''
        //         let toRead = targetLength

        //         const readFromStream = () => {
        //             let chunk;
        //             while (toRead > 0 && (chunk = bitStream.read(toRead)) !== null) {
        //                 content += chunk.toString();
        //                 toRead = targetLength - content.length
        //             }
                    
        //             bitStream.off('readable', readFromStream);
        //             return resolve(content)
        //         }
        //         bitStream.on('readable', readFromStream);
        //     })
        // },
        readBits(bits) {
            return this.read(bits)
        },
        readInt(bits) {
            return this.read(bits)
                .then((content) => Number.parseInt(content, 2))
        },
        async readToEnd() {
            let chunks = []
            for await(let chunk of bitStream) {
                chunks.push(chunk)
            }
            return Buffer.concat(chunks)
        },
    }
}

class InMemoryReader {
    constructor(content) {
        this.content = content
        this.processed = 0
    }

    read(maxLength) {
        const result = this.content.substring(this.processed, this.processed + maxLength)
        this.processed += result.length
        return result
    }

    get status() {
        if (this.processed >= this.content.length) {
            return 'drained'
        }
        return 'ready'
    }

    static async drain(stream) {
        const chunks = []
        for await (let chunk of stream) {
            chunks.push(chunk)
        }

        return new InMemoryReader(Buffer.concat(chunks).toString())
    }
}