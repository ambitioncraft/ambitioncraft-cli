import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import config from '../config.json'
import {InstanceCommandBase} from '../command-base'
import {InstanceStatus} from '../instance-info'
import retry from 'async-retry'
export default class StartCommand extends InstanceCommandBase {
  static allowWithAll = false
  static description = 'start a server instance'

  static examples = [
    '$ mc start uhc',
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
    const status = this.instance.getServiceStatus()
    if (status === InstanceStatus.Active) {
      this.warn(`instance: ${this.instanceName} already active`)
      return
    }

    const command = `${config.mcService} start ${this.instanceName}`
    const result = shell.exec(command, {silent: true})
    this.info(`instance: ${this.instanceName} is starting`)
    try {
      const isReady = await retry(async abort => {
        await this.instance.sendRconCommand('say ping')
        return true
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
      }
    } catch {
      this.danger('timeout: server did not respond')
    }
  }
}
