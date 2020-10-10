import Discord, {Message, MessageEmbed} from 'discord.js'
import {Config, IConfig, load} from '@oclif/config'
import McCommand, {InstanceCommandBase} from '../command-base'
import {Command} from '@oclif/config/lib/command'
import config from '../config.json'
import {Help} from '@oclif/plugin-help'
import {run} from '@oclif/command'
import CommandContext from '../command-context'
import CommandResponse, {Colors, loglevel} from '../command-response'
import {debug} from 'console'
import DiscordCommandContext from './discord-command-context'

export default class DiscordBot extends Discord.Client {
  channelsMap: { [index: string]: string } = {}
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
    const prefix = config.discord.prefix

    if (message.author.bot) {
      return
    }
    if (!this.channelsMap[message.channel.id]) {
      return
    }
    if (!message.content.startsWith(prefix)) {
      return
    }

    const instanceId = this.channelsMap[message.channel.id]

    const args = lineToArgs(message.content.substring(prefix.length).trim())
    const command = args[0]
    console.log('command', command, args)
    if (!this.commands[command]) {
      // not a valid discord command
      console.log('not a valid discord command')
      return
    }

    if (instanceId.includes('*')) {
      // from the global channel
      console.log('from a main channel')
    } else {
      // from an instance channel
      console.log('from bridge channel')
    }
    const commandToRun = this.commands[args[0]]
    if (commandToRun.args.some(a => a === InstanceCommandBase.instanceArg)) {
      // make sure we get the instance name from discord mapping...
    }
    const user = {
      name: message.member?.user.username || '',
      roles: message.member?.roles.cache.map(x => x.name) || [],
    }

    const context = new DiscordCommandContext(
      message,
      args,
      user
    )
    await context.executeCommand(this.cmdConfig)
  }
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

function createErrorEmbed(error: string) {
  const embed = new MessageEmbed()
  .setColor('DARK_RED')
  .setDescription(error)

  return embed
}

function codeBlock(text: string, language = '') {
  return '```' + language + '\n' + text + '\n```'
}
