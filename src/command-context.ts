import CommandResponse from './command-response'
import {run} from '@oclif/command'
import {Config, IConfig, load} from '@oclif/config'
export type user = { name: string }

export default class CommandContext {
    // eslint-disable-next-line no-useless-constructor
    commandResponse: CommandResponse
    commandPrefix = '$ mcd '
    constructor(public client: any, public readonly args: string[], public user?: user) {
      this.commandResponse = new CommandResponse()
    }

    async executeCommand(cmdConfig: Config | IConfig) {
      try {
        // for now we need to clone the config to establish some sort of context.
        const runConfig = Object.assign(Object.create(Object.getPrototypeOf(cmdConfig)), cmdConfig, {run_context: this})
        await run(this.args, runConfig)
      } catch (error) {
        if (error.oclif?.exit !== 0) {
          this.commandResponse.error(error.message)
          console.log(error.message)
        }
      }
      await this.commandResponse.flush()
    }

    createChildContext(args: string[]) {
      return new CommandContext(this.client, args, this.user)
    }
}

