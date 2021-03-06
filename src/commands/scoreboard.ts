
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import {InstanceCommandBase} from '../command-base'
import {RealmInfo, RealmStatus} from '../realm/realm-info'

export default class ScoreboardCommand extends InstanceCommandBase {
  static allowWithAll = true
  static aliases = ['sb']
  static description = 'displays the scoreboard associated to a specific objective'

  static examples = [
    '$ mc scoreboard uhc deaths',
    '$ mc sb uhc deaths --whitelist',
    '$ mc sb uhc deaths -w',
  ]

  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
    {name: 'objective', required: true, description: 'name of the scoreboard objective'},
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
    whitelist: flags.boolean({char: 'w', description: 'only show whitelisted players'}),
  }

  async run() {
    const {objective} = this.args
    const {whitelist} = this.flags
    if (!this.instance.isActiveInstance) {
      this.error(`${this.instanceName} is not active`)
    }
    const scores = await getScores(this.instance.realm, objective, whitelist)

    this.response
    .setTitle(`Scoreboard: ${objective}`)
    .setDescription(true, scores.map(s => `${s[0]}:`.padEnd(16, ' ') + s[1]).join('\n'))

    this.console(this.response.toConsoleFormat())
  }
}

export async function getScores(instance: RealmInfo, objective: string, whiteListOnly: boolean) {
  const players = await getPlayers(instance, whiteListOnly)

  // Get scores for each player
  const scores = []
  for (let i = 0; i < players.length; i++) {
    const player = players[i]
    // eslint-disable-next-line no-await-in-loop
    const resp = await instance.sendRconCommand(`scoreboard players get ${player} ${objective}`)
    if (resp.includes("Can't get value of")) continue
    if (resp.includes('Unknown scoreboard objective')) break
    scores.push([player, resp.split(' ')[2]])
  }

  scores.sort((a: any, b: any) => {
    return b[1] - a[1]
  })

  scores.push([
    'Total',
    (scores.length === 0) ? 0 : String(scores.reduce((a, b) => {
      // eslint-disable-next-line radix
      return a + parseInt(b[1])
    }, 0)),
  ])

  return scores
}
export async function getPlayers(instance: RealmInfo, whiteListOnly: boolean) {
  let resp: string
  if (whiteListOnly) {
    resp = await instance.sendRconCommand('whitelist list')
  } else {
    resp = await instance.sendRconCommand('scoreboard players list')
  }

  const players = resp.substring(resp.indexOf(':') + 2).split(', ')
  return players
}
