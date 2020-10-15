import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import {InstanceCommandBase} from '../command-base'
import {InstanceStatus} from '../instance-info'

export default class StartCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'stop a server instance'

  static examples = [
    '$ mc stop uhc',
  ]

  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {...InstanceCommandBase.flags}

  // eslint-disable-next-line require-await
  async run() {
    const status = this.instance.status()
    if (status !== InstanceStatus.Active) {
      this.warn(`instance: ${this.instanceName} is not running`)
      return
    }
    await this.instance.stop()
    this.success(`instance: ${this.instanceName} stopped`)
  }
}
