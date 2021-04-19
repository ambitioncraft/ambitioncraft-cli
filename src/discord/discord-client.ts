import {DiscordBot} from './discord-bot'
import {CliConfig} from '../config'

let config: CliConfig
try {
  config = require('../config.json') as CliConfig
} catch {
  throw new Error('config.json not found')
}

// const cli = new ConsoleCommandClient(config)
const bot = new DiscordBot(config)

// cli.start(() => {
//   console.log('cli ready')
// })

bot.start(() => {
  console.log('bot is ready')
})

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('unhandledRejection', error)
})
