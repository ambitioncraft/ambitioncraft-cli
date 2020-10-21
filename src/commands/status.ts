
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import {InstanceCommandBase} from '../command-base'
import {InstanceInfo, InstanceStatus} from '../instance/instance-info'
import {LocalInstance} from '../instance/local-instance'

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
    this.console(this.instanceName)
    const status = await this.instance.status()
    if (status === 'running' || status === 'starting') {
      this.success(`Service: ${status}`)
    } else {
      this.danger(`Service: ${status}`)
    }

    const rconConnected = await this.instance.isReady()
    if (rconConnected) {
      this.success('Rcon: online')
    } else {
      this.danger('Rcon: offline')
    }
  }
}
