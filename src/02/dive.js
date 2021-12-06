import readline from'readline'
import fs from 'fs'
import path from 'path'
import url from 'url'

export async function executeTask() {
    const dir = path.dirname(url.fileURLToPath(import.meta.url))
    const file = path.join(dir, 'input.txt')

    const submarine = { depth: 0, distance: 0 }
    const commands = {
        forward: (submarine, distance) => submarine.distance += distance,
        up: (submarine, distance) => submarine.depth -= distance,
        down: (submarine, distance) => submarine.depth += distance,
    }

    const commandProcessor = function (command) {
        const commandFn = commands[command]
        if (!commandFn) {
            console.warn("Unrecognized command", command);
            return
        }
        const args = [...arguments]
        args[0] = submarine
        commandFn.apply(undefined, args)
    }


    await streamCommands(file, commandProcessor)
    console.log(JSON.stringify(submarine), submarine.depth * submarine.distance);
}

async function streamCommands(file, onCommand) {
    return new Promise((resolve) => {
        const lineReader = readline.createInterface({
            input: fs.createReadStream(file),
          });
          
        lineReader.on('line', function (line) {
            let [command, distance] = line.split(' ', 2)
            distance = Number.parseInt(distance)
            onCommand(command, distance)
        });
        lineReader.on('close', () => resolve())
    })
}

executeTask()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })