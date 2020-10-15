/* eslint-disable no-console */
import readline from 'readline'
import {ConsoleCommandClient} from './command-client'
import {CliConfig} from './config'

let config: CliConfig
try {
  config = require('../config.json') as CliConfig
} catch {
  console.error('config.json not found')
  throw new Error('config.json not found')
}

const commandClient = new ConsoleCommandClient(config)

commandClient.start()

commandClient.once('ready', () => {
  console.log('Ready')
})
