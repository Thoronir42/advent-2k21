export function createGraph(opts = {}) {
    return {
        nodes: {},

        getNode(name) {
            if (!this.nodes[name]) {
                const node = opts.createNode?.(name)
                if (!node.name) {
                    node.name = name
                }
                node.edges = []
                this.nodes[name] = node

            }
            return this.nodes[name]
        },
        addEdge(aName, bName, biDirectional) {
            const aNode = this.getNode(aName)
            const bNode = this.getNode(bName)
            aNode.edges.push(bName)
            if (biDirectional) {
                bNode.edges.push(aName)
            }
        },
    }
}

export function enumerateAllPaths(graph, from, to, edgeValid) {
    const paths = []

    const toWalk = [[from]]

    while (toWalk.length) {
        const path = toWalk.shift()
        const fromName = path[path.length - 1]
        const topNode = graph.nodes[fromName]

        topNode.edges.forEach((toName) => {
            const nodeTo = graph.nodes[toName]
            if (!edgeValid(path, nodeTo, topNode)) {
                return
            }

            if (fromName === to) {
                return
            }
            const toPath = [...path, toName]
            if (toName === to) {
                paths.push(toPath)
                return
            }
            toWalk.unshift(toPath)
        })
    }
    paths.sort()
    

    return paths
}