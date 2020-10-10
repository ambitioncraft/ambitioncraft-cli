import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import config from '../config.json'
import {InstanceCommandBase} from '../command-base'
import {InstanceStatus} from '../instance-info'

export default class StartCommand extends InstanceCommandBase {
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

    const command = `${config['mc-service']} start ${this.instanceName}`
    const result = shell.exec(command, {silent: true})
    this.info(`instance: ${this.instanceName} is starting`)
  }

  // async isOnline() {
  //   try {
  //     const response = await this.instance.sendRconCommand('say hello')
  //     if(response)
  //   } catch {
  //     return
  //   }
  // }
}
