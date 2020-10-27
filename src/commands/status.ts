
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import {InstanceCommandBase} from '../command-base'
import {RealmInfo, RealmStatus} from '../realm/realm-info'
import {LocalRealm} from '../realm/local-realm'

export default class StatusCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'see the status of a server instance'

  static examples = [
    '$ mc status uhc',
    '$ mc status --realm=uhc',
  ]

  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
  }

  async run() {
    const state = await this.instance.realm.getState()
    if (this.instance.isActiveInstance) {
      this.success(`Active Instance: ${state.activeInstance}`)
    } else {
      this.danger(`Active Instance: ${state.activeInstance}`)
      return
    }
    if (state.status === 'running' || state.status === 'starting') {
      this.success(`Server: ${state.status}`)
    } else {
      this.danger(`Server: ${state.status}`)
    }
    if (state.isRconReady) {
      this.success('Rcon: online')
    } else {
      this.danger('Rcon: offline')
    }
  }
}
