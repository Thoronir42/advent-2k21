export default class SparseArray {
    constructor(dimensions) {
        this.min = Array.from({length: dimensions}).map(() => Number.MAX_SAFE_INTEGER)
        this.max = Array.from({length: dimensions}).map(() => Number.MIN_SAFE_INTEGER)

        this.points = []
    }
    get dimensions() {
        return this.min.length
    }

    push(point, value) {
        point.forEach((offset, i) => {
            if (offset < this.min[i]) {
                this.min[i] = offset
            }
            if (offset > this.max[i]) {
                this.max[i] = offset
            }
        })

        this.points.push([point, value])
    }

    toDenseArray() {
        if (this.dimensions !== 2) {
            throw new Error(`Sparse densification not implemented with ${this.dimensions} dimensions `)
        }

        const result = []
        for (let y = this.min[1]; y <= this.max[1]; y++) {
            const row = []
            result.push(row)
            for (let x = this.min[0]; x <= this.max[0]; x++) {
                row[x] = 0
            }
        }

        this.points.forEach(([[x, y], value]) => {
            result[y - this.min[1]][x - this.min[0]] += value
        })

        return result
    }
}
