
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import {InstanceCommandBase} from '../core/command-base'
import {Colors} from '../core/command-response'
import {McServer} from '../mc-server/mc-server'

export default class MsptCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'get the mspt of a server'
  static alias = ['tps']
  static examples = [
    'mspt cmp',
  ]

  static flags: flags.Input<any> = {...InstanceCommandBase.flags}
  static args: Parser.args.IArg<any>[] = [...InstanceCommandBase.args]

  async run() {
    const {tps, mspt} = await queryMSPT(this.instance)
    const text = `TPS: ${tps.toFixed(1)} MSPT: ${mspt.toFixed(1)}`

    if (mspt >= 50) {
      this.danger(text)
    } else if (mspt <= 25) {
      this.success(text)
    } else {
      this.warn(text)
    }
  }
}

export async function queryMSPT(instance: McServer) {
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
