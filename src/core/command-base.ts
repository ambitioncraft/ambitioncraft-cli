/* eslint-disable valid-jsdoc */
import Command, {flags} from '@oclif/command'
import {PrettyPrintableError} from '@oclif/errors'
import * as Parser from '@oclif/parser'
import CommandContext from './command-context'
import CommandResponse from './command-response'
import {McServer} from '../mc-server/mc-server'

import store from './store'

export abstract class McCommand extends Command {
  static flags: flags.Input<any> = {
    help: flags.help({char: 'h', description: 'display command help'}),
  }

  flags: any

  args: any

  store = store

  messageLog: string[] = []

  context: CommandContext

  get response() {
    return this.context.commandResponse
  }

  constructor(argv: string[], config: any) {
    super(argv, config)
    this.context = config.run_context || new CommandContext(argv)
  }

  async init() {
    await super.init()
    const {flags, args} = this.parse(this.constructor as any)

    this.flags = flags
    this.args = args
  }

  console(message?: string | CommandResponse, ...args: any[]) {
    super.log(message as string, ...args)
  }

  info(message: string) {
    this.console(message)
    this.response.info(message)
  }

  success(message: string) {
    this.console(message)
    this.response.success(message)
  }

  /**
   * @deprecated Use info or console instead
  */
  log(message?: string, ...args: any[]) {
    super.log(message, ...args)
  }

  exit(code?: number | undefined): never {
    super.exit(code)
  }

  error(input: string | Error, options: { code?: string; exit: false } & PrettyPrintableError): void
  error(input: string | Error, options?: { code?: string; exit?: number } & PrettyPrintableError): never
  error(input: string | Error, options: { code?: string; exit?: number | false } & PrettyPrintableError = {}) {
    if (options.exit === false) {
      this.response.error(input as string)
    }
    super.error(input, options as any)
  }

  warn(input: string | Error) {
    this.response.warn(input as string)
    super.warn(input)
  }

  danger(input: string | Error) {
    this.response.warn(input as string)
    super.warn(input)
  }

  async catch(err: any) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    // console.log('uncaught error')
    // send an error embed
    return await super.catch(err)
  }

  async finally(err: any) {
    // called after run and catch regardless of whether or not the command errored
    return await super.finally(err)
  }
}

export abstract class InstanceCommandBase extends McCommand {
  /** Allow this method to run with the realm --all command */
  static allowWithAll = false // do not change this here, change this on the child class
  static instanceArg = {name: 'server', required: true, description: 'Name of the server (smp, cmp, copy)'}
  static args: Parser.args.IArg<any>[] = [InstanceCommandBase.instanceArg]
  instance!: McServer

  public get instanceName(): string {
    return this.instance.name
  }

  async init() {
    await super.init()
    const name = this.args.server
    if (!name) {
      this.error('Server not specified')
    }
    const instance = await store.getMcServer(name)
    if (!instance) {
      this.error(`Server ${name} does not exist.`)
    }
    this.instance = instance
  }
}
