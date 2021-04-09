import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import {InstanceCommandBase} from '../core/command-base'

export default class StartCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'stop a server instance'

  static examples = [
    '$!stop uhc',
    '$!stop --realm=uhc',
  ]

  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
  }

  // eslint-disable-next-line require-await
  async run() {
    await this.instance.stop()
    this.warn(`instance: ${this.instanceName} stopping`)
  }
}
