
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import {InstanceCommandBase} from '../command-base'
import {Colors} from '../command-response'
import {InstanceInfo, InstanceStatus} from '../instance-info'

export default class MsptCommand extends InstanceCommandBase {
  static description = 'get the mspt of a server'
  static alias = ['tps']
  static examples = [
    '$ mc mspt uhc',
  ]

  static flags: flags.Input<any> = {...InstanceCommandBase.flags}
  static args: Parser.args.IArg<any>[] = [...InstanceCommandBase.args]

  async run() {
    const {tps, mspt} = await queryMSPT(this.instance)

    let color: Colors = Colors.ORANGE
    if (mspt >= 50) {
      color = Colors.RED
    } else if (mspt <= 25) {
      color = Colors.GREEN
    }

    this.response
    .setColor(color)
    .setTitle(`TPS: ${tps.toFixed(1)} MSPT: ${mspt.toFixed(1)}`)

    this.console(this.response.toConsoleFormat())
  }
}

export async function queryMSPT(instance: InstanceInfo) {
  const data = await instance.sendRconCommand('script run reduce(last_tick_times(),_a+_,0)/100;')
  const mspt = parseFloat(data.split(' ')[2])
  let tps

  if (mspt <= 50) {
    tps = 20.0
  } else {
    tps = 1000 / mspt
  }
  return {tps, mspt}
}
