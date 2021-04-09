import CommandResponse from './command-response'
import {run} from '@oclif/command'
import {Config, IConfig, load} from '@oclif/config'
export type user = { name: string }

export default class CommandContext {
  commandResponse: CommandResponse
  commandPrefix: string | undefined
  constructor(public readonly args: string[], public source?: any) {
    this.commandResponse = new CommandResponse()
  }

  async executeCommand(cmdConfig: Config | IConfig) {
    try {
      // for now we need to clone the config to establish some sort of context.
      const runConfig = Object.assign(Object.create(Object.getPrototypeOf(cmdConfig)), cmdConfig, {run_context: this})
      await run(this.args, runConfig)
    } catch (error) {
      if (error.oclif && error.oclif.exit === 0) {
        // this was just a help command, ignore
      } else {
        // actual error occured
        this.commandResponse.error(error.message)
        // eslint-disable-next-line no-console
        console.error(error.message)
      }
    }
    await this.commandResponse.flush()
  }

  createChildContext(args: string[]) {
    return new CommandContext(args)
  }
}

