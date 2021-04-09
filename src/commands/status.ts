
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import {InstanceCommandBase, McCommand} from '../core/command-base'
import {McServer} from '../mc-server/mc-server'

import store from '../core/store'

export default class StatusCommand extends McCommand {
  static allowWithAll = true
  static description = 'see the status of a server instance'

  static examples = [
    '$ mc status uhc',
    '$ mc status --realm=uhc',
  ]

  static args: Parser.args.IArg<any>[] = [
    {name: 'server', required: false, description: 'Name of the server'},
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
  }

  server!: McServer
  async init() {
    const {flags, args} = this.parse(this.constructor as any)
    this.flags = flags
    this.args = args

    const serverName = this.flags.realm || this.args.server.split('.')[0]
    const server = await store.getMcServer(serverName)
    if (!server) {
      this.error(`Server: ${serverName} not found.`)
    }
    this.server = server
  }

  async run() {
    const state = await this.server.getState()
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
      const list = await this.server.sendRconCommand('list')
      this.info('')
      this.info(list)
    }
  }
}
