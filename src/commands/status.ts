
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import {InstanceCommandBase, McCommand} from '../core/command-base'
import {McServer} from '../mc-server/mc-server'

import store from '../core/store'

export default class StatusCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'see the status of a server instance'

  static examples = [
    'status smp',
    'status copy',
  ]

  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
  }
  
  async run() {
    const state = await this.instance.getState()
    if (state.status === 'running' || state.status === 'starting') {
      this.success(`State: ${state.status}`)
    } else {
      this.danger(`State: ${state.status}`)
    }
    if (state.isRconReady) {
      this.success('Rcon: online')
    } else {
      this.danger('Rcon: offline')
    }
    this.info('')
    if (state.isRconReady) {
      const list = await this.instance.sendRconCommand('list')
      this.info('')
      this.info(list)
    }
  }
}
