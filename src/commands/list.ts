
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import {InstanceCommandBase} from '../command-base'
import {RealmInfo, RealmStatus} from '../realm/realm-info'

export default class ListCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'list all players on a server'

  static examples = [
    '$ mc list uhc --realm=east',
    '$ mc list east.uhc',
  ]

  static args: Parser.args.IArg<any>[] = [...InstanceCommandBase.args]
  static flags: flags.Input<any> = {...InstanceCommandBase.flags}

  async run() {
    if (!this.instance.isActiveInstance) {
      this.error(`${this.instanceName} is not active`)
    }
    const online = await getOnlinePlayers(this.instance.realm)
    if (online.onlineCount === '0') {
      online.players = ['No online players']
    }
    this.response
    .setTitle(`${online.onlineCount}/${online.maxCount} players on ${this.instanceName}`)
    .addField('Players', online.players.join('\n').replace(/([_*~`])/g, '\\$1'))

    this.console(this.response.toConsoleFormat())
  }
}

export async function getOnlinePlayers(realm: RealmInfo) {
  const reply = await realm.sendRconCommand('list')
  const data = reply.split(' ')
  return {
    onlineCount: data[2],
    maxCount: (data[6] === 'of') ? data[7] : data[6],
    players: data.slice(9),
  }
}
