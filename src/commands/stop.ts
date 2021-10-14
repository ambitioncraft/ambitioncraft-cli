import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import {InstanceCommandBase} from '../core/command-base'
import {stopInstance} from '../mc-server/mc-server'

export default class StartCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'stop a server instance'

  static examples = [
    '$stop smp',
    '$stop copy',
  ]

  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
  }

  // eslint-disable-next-line require-await
  async run() {
    this.warn(`instance: ${this.instanceName} stopping`)
    try {
      await stopInstance(this.instance, true)
    } catch (error) {
      if (error instanceof Error) {
        this.error(error.message)
      }
    }
    this.info('instance stopped.')
  }
}
