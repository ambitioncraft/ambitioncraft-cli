
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import {InstanceCommandBase} from '../core/command-base'
import {McServer} from '../mc-server/mc-server'

export default class ListCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'list all players on a server'

  static examples = [
    '!list cmp',
  ]

  static args: Parser.args.IArg<any>[] = [...InstanceCommandBase.args]
  static flags: flags.Input<any> = {...InstanceCommandBase.flags}

  async run() {
    const online = await getOnlinePlayers(this.instance)
    if (online.onlineCount === '0') {
      online.players = ['No online players']
    }
    this.response
    .setTitle(`${online.onlineCount}/${online.maxCount} players on ${this.instanceName}`)
    .addField('Players', online.players.join('\n').replace(/([_*~`])/g, '\\$1'))

    this.console(this.response.toConsoleFormat())
  }
}

export async function getOnlinePlayers(server: McServer) {
  const reply = await server.sendRconCommand('list')
  const data = reply.split(' ')
  return {
    onlineCount: data[2],
    maxCount: (data[6] === 'of') ? data[7] : data[6],
    players: data.slice(9),
  }
}
