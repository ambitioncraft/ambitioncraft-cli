import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import {InstanceCommandBase} from '../core/command-base'
import {McServer, startInstance} from '../mc-server/mc-server'
import retry from 'async-retry'
import store from '../core/store'

export default class StartCommand extends InstanceCommandBase {
  static allowWithAll = false
  static description = 'start a server instance'

  static examples = [
    'start smp',
    'start copy',
  ]

  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
    // todo: add flag to ignore notify
  }

  static maxTimout = 20000
  // eslint-disable-next-line require-await
  async run() {
    this.info(`server: ${this.instanceName} is starting`)
    try {
      await startInstance(this.instance)
      this.success('server is online')
    } catch {
      this.danger('timeout: server did not respond')
    }
  }
}
