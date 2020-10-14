/* eslint-disable no-console */

import './utils/helpers'
import {run} from '@oclif/command'
import readline from 'readline'
import CommandContext from './command-context'
import * as oclif from '@oclif/config'

async function start() {
  const rl = readline.createInterface(process.stdin, process.stdout)
  const commandConfig = await oclif.load(__dirname)

  rl.on('line', async function (line: string) {
    try {
      if (line.startsWith('.')) {
        const args = lineToArgs(line.substr(1))
        const context = new CommandContext(null, args)
        await context.executeCommand(commandConfig)
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

  process.on('unhandledRejection', error => {
    console.error('unhandledRejection', error)
  })
}

module.exports = start()

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
