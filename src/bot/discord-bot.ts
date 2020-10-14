import Discord, {Message, MessageEmbed} from 'discord.js'
import {Config, IConfig, load} from '@oclif/config'
import McCommand, {InstanceCommandBase} from '../command-base'
import {Command} from '@oclif/config/lib/command'
import {Help} from '@oclif/plugin-help'
import {run} from '@oclif/command'
import CommandContext from '../command-context'
import CommandResponse, {Colors, loglevel} from '../command-response'
import {debug} from 'console'
import DiscordCommandContext from './discord-command-context'
import config from '../config'
import {cp} from 'shelljs'

export default class DiscordBot extends Discord.Client {
  channelsMap = {} as { [key: string]: string }

  commands: { [index: string]: Command.Plugin } = {}
  cmdConfig!: Config | IConfig

  constructor() {
    super()
    this.channelsMap = config.discord.channels
  }

  async start() {
    this.cmdConfig = await load(__dirname)
    this.cmdConfig.commands.forEach(c => {
      this.commands[c.id] = c
      c.aliases.forEach(a => {
        this.commands[a] = c
      })
    })
    this.on('message', this.onMessageReceived)
    await this.login(config.discord.token)
  }

  async onMessageReceived(message: Discord.Message) {
    const prefix = config.discord.commandPrefix

    if (message.author.bot) {
      return
    }
    if (!this.channelsMap[message.channel.id]) {
      return
    }
    if (!message.content.startsWith(prefix)) {
      return
    }

    const instance = this.channelsMap[message.channel.id]

    const args = lineToArgs(message.content.substring(prefix.length).trim())
    const commandToRun = this.cmdConfig.findCommand(args[0], {must: false})

    if (!commandToRun) {
      // not a valid discord command
      console.log('not a valid discord command')
      message.reply(`\`${args[0]}\` is not a valid discord command`)
      return
    }
    const roles = message.member?.roles.cache.map(x => x.name) || []

    if (!hasCommandAccess(roles, commandToRun.id)) {
      console.log('no access to command')
      message.reply(`You do not have access to the \`${commandToRun.id}\` command`)
      return
    }

    if (instance === '*') {
      // from the global channel
      console.log('from a main channel')
    } else {
      // from an instance channel
      console.log('from bridge channel')
    }

    if (commandToRun.args.some(a => a === InstanceCommandBase.instanceArg)) {
      // make sure we get the instance name from discord mapping...
    }
    const user = {
      name: message.member?.user.username || '',
    }

    const context = new DiscordCommandContext(
      message,
      args,
      user
    )
    await context.executeCommand(this.cmdConfig)
  }
}

function hasCommandAccess(roles: string[], commandId: string): boolean {
  roles = ['*', ...roles]
  return roles.some(role => {
    const cmdList = config.discord.roles[role]?.commands || []
    return cmdList.includes('*') || cmdList.includes(commandId)
  })
}

function lineToArgs(line: any) {
  const arr: string[] = line.match(/\\?.|^$/g).reduce((p: any, c: string) => {
    if (c === '"') {
      p.quote ^= 1
    } else if (!p.quote && c === ' ') {
      p.a.push('')
    } else {
      p.a[p.a.length - 1] += c.replace(/\\(.)/, '$1')
    }
    return p
  }, {a: ['']}).a
  return arr.filter(x => x !== '')
}
