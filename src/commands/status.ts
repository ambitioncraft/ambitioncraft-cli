
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import {InstanceCommandBase} from '../command-base'
import {InstanceStatus} from '../instance-info'

export default class StatusCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'see the status of a server instance'

  static examples = [
    '$ mc status uhc',
  ]

  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
  }

  // eslint-disable-next-line require-await
  async run() {
    const status = this.instance.status()
    if (status === InstanceStatus.Active) {
      this.success('Service: online')
    } else {
      this.danger('Service: offline')
    }
    const rconConnected = await this.instance.isRconConnected()
    if (rconConnected) {
      this.success('Rcon: online')
    } else {
      this.danger('Rcon: offline')
    }
  }
}
