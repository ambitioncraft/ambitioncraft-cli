import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import {InstanceCommandBase} from '../command-base'
import {RealmInfo, RealmStatus} from '../realm/realm-info'
import retry from 'async-retry'
import store from '../store'
export default class StartCommand extends InstanceCommandBase {
  static allowWithAll = false
  static description = 'start a server instance'

  static examples = [
    '$ mc start uhc.paper',
    '$ mc start paper --realm=uhc',
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
    await this.instance.start()
    this.info(`server: ${this.instanceName} is starting`)
    try {
      const isReady = await retry(async abort => {
        const result = await this.instance.isReady()
        if (!result) throw new Error('not started yet...')
        return result
      }, {
        maxRetryTime: 60000,
        minTimeout: 2000,
        maxTimeout: 5000,
        onRetry: (e, i) => {
          this.console(`attempting to connect... attempt: ${i}`)
        },
      })
      if (isReady) {
        this.success('server is online')
        return
      }
    } catch {
      this.danger('timeout: server did not respond')
    }
  }
}
