export default class LineParser {
    constructor(lineHandlers, initialState = 'default') {
        this.lineHandlers = lineHandlers
        this.state = initialState
    }
    
    processLine(line) {
        const handler = this.lineHandlers[this.state]
        this.state = handler(line) || this.state
    }
}