import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import fs, {write} from 'fs'
import Path from 'path'
import * as inquirer from 'inquirer'
import {InstanceCommandBase} from '../command-base'

const invalidCommands = [
  'Incorrect argument for command',
  'Unknown or incomplete command',
  'Expected whitespace to end one argument, but found trailing data',
  'Could not parse command:',
  '<--[HERE]',
  'No player was found',
  'An unexpected error occurred trying to execute that command',
]

export default class ExecuteCommand extends InstanceCommandBase {
  static aliases = ['run']
  static description = 'Execute a command using rcon'
  static examples = [
    '$ mc execute uhc whitelist add ilmango',
    '$ mc run give ilmango minecraft:stone_axe',
  ]

  static strict = false
  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
    {name: 'mccommand', required: true, description: 'Minecraft command to execute'},
  ]

  static flags: flags.Input<any> = {...InstanceCommandBase.flags}

  async run() {
    if (!this.instance.isActiveInstance) {
      this.error(`${this.instanceName} is not active`)
    }
    const {mccommand} = this.args
    const fullCommand = this.argv.slice(1).filter(x => !x.startsWith('--realm')).join(' ')

    let response = await this.instance.realm.sendRconCommand(fullCommand)
    response = response.trim()
    this.info(`command sent: ${fullCommand}`)
    let isError = false
    for (let i = 0; i < invalidCommands.length; i++) {
      const error = invalidCommands[i]
      if (response.includes(error)) {
        isError = true
        break
      }
    }

    if (isError) {
      this.danger(response)
    } else {
      this.info(response)
    }
  }
}
