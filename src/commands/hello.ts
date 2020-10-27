import Command from '@oclif/command'
import {InstanceCommandBase, McCommand} from '../command-base'
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import {RealmInfo} from '../realm/realm-info'
export class HelloCommand extends InstanceCommandBase {
  static description = 'description of this example command'

  static args: Parser.args.IArg<any>[] = [...InstanceCommandBase.args]
  static flags: flags.Input<any> = {...InstanceCommandBase.flags}

  // eslint-disable-next-line require-await
  async run() {
    this.info('running my command')
    const response = await getActiveInstance(this.instance.realm)
    console.log(response)
  }
}

export async function getActiveInstance(realm: RealmInfo) {
  const result = await realm.sendRconCommand('list')
  // realm.rcon?.end()
  return result
}
