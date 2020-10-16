import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import fs, {write} from 'fs'
import Path from 'path'
import * as inquirer from 'inquirer'
import {McCommand, InstanceCommandBase} from '../command-base'
import CommandContext from '../command-context'

const invalidCommands = [
  'Incorrect argument for command',
  'Unknown or incomplete command',
  'Expected whitespace to end one argument, but found trailing data',
  'Could not parse command:',
  '<--[HERE]',
  'No player was found',
  'An unexpected error occurred trying to execute that command',
]

export default class InstanceCommand extends McCommand {
  static aliases = ['i']
  static description = 'Execute a command across one or more instance'
  static examples = [
    '$ mc instance mspt --all',
    '$ mc i status -i=uhc -i=uhc2',
  ]

  static strict = false
  static args: Parser.args.IArg<any>[] = [
    {name: 'command', required: true, description: 'command to execute'},
  ]

  static flags: flags.Input<any> = {
    all: flags.boolean({char: 'a', description: 'execute command for all instances', exclusive: ['instance']}),
    instance: flags.string({char: 'i', description: 'instance to use', multiple: true, exclusive: ['all']}),
  }

  // eslint-disable-next-line require-await
  async run() {
    const {all} = this.flags
    const commandId = this.args.command
    const plugin = this.config.findCommand(commandId, {must: true})
    const commandClass = plugin.load()

    if (!(commandClass as unknown as typeof InstanceCommandBase).allowWithAll) {
      this.error(`${commandId}: is not a valid instance command`)
    }
    const servers = this.store.getAllInstances()
    for (const instance of servers) {
      const args = [...Object.values(this.args), instance.name] as string[]
      const childContext = this.context.createChildContext(args)
      // eslint-disable-next-line no-await-in-loop
      await childContext.executeCommand(this.config)
      // await this.config.runCommand(commandId, args.splice(1))
    }
  }
}
