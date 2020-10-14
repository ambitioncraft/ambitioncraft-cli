
import './utils/helpers'
import {run} from '@oclif/command'
import readline from 'readline'
import flush from '@oclif/command/flush'
import DiscordBot from './bot/discord-bot'
import CommandContext from './command-context'
import DiscordCommandContext from './bot/discord-command-context'
import store from './store'

const rl = readline.createInterface(process.stdin, process.stdout)

const bot = new DiscordBot()
bot.start()

rl.on('line', async function (line: string) {
  try {
    if (line.startsWith('.')) {
      const args = lineToArgs(line.substr(1))
      await run(lineToArgs(line.substr(1)))
    } else if (line.startsWith('mc ')) {
      await run(lineToArgs(line.substr(3)))
    } else {
      return
    }
  } catch (error) {
    if (error.oclif && error.oclif.exit !== 0) {
      console.error(error.message)
      console.debug(error)
    } else {
      console.log(error)
    }
  }
}).on('close', () => {
  console.log('closed')
})

function lineToArgs(line: any) {
  const arr: string[] = line.match(/\\?.|^$/g).reduce((p: any, c: string) => {
    if (c === '"') {
      p.quote ^= 1
    } else if (!p.quote && c === ' ') {
      p.a.push('')
    } else {
      p.a[p.a.length - 1] += c.replace(/\\(.)/, '$1')
    }
    return p
  }, {a: ['']}).a
  return arr.filter(x => x !== '')
}

// process.on('unhandledRejection', error => {
//   // Will print "unhandledRejection err is not defined"
//   // console.log('unhandledRejection', error.message);
// });
