/* eslint-disable no-console */

import Discord, {Message, MessageEmbed} from 'discord.js'
import DiscordCommandContext from './discord-command-context'
import {CliConfig} from '../config'
import {CommandClientBase} from '../cli/command-client'

export class DiscordBot extends CommandClientBase {
  channelsMap = {} as { [key: string]: string }
  discordClient: Discord.Client
  constructor(public config: CliConfig) {
    super(config)
    this.discordClient = new Discord.Client()
    this.channelsMap = config.discord.channels
  }

  async onStart(): Promise<void> {
    await this.discordClient.login(this.config.discord.token)
    this.discordClient.on('message', message => this.onMessageReceived(message))
    this.discordClient.on('messageUpdate', (oldMsg, newMsg) => this.onMessageEdited(oldMsg, newMsg))
    this.on('run-command', this.onRunCommand)
  }

  async onRunCommand({args, message}: {args: string[]; message: Discord.Message}) {
    const context = new DiscordCommandContext(args, message)
    await context.executeCommand(this.commandConfig)
  }

  onMessageEdited(oldMsg: Discord.Message | Discord.PartialMessage, newMsg: Discord.Message | Discord.PartialMessage) {
    if (newMsg.partial || newMsg.author.bot || !newMsg.editedTimestamp) {
      return
    }
    // see if its within the last minute
    if (newMsg.editedTimestamp - oldMsg.createdTimestamp > 60000) {
      return
    }

    if (oldMsg.content !== newMsg.content) {
      this.onMessageReceived(newMsg)
    }
  }

  onMessageReceived(message: Discord.Message | Discord.PartialMessage) {
    if (message.author?.bot) {
      return
    }
    if (!this.channelsMap[message.channel.id]) {
      return
    }
    const prefix = this.config.discord.commandPrefix
    if (!message.content?.startsWith(prefix)) {
      return
    }
    const instance = this.channelsMap[message.channel.id]
    const args = lineToArgs(message.content.substring(prefix.length).trim())
    const commandToRun = this.commandConfig.findCommand(args[0], {must: false})

    if (!commandToRun) {
      // not a valid discord command
      console.log('not a valid discord command')
      message.reply(`\`${args[0]}\` is not a valid discord command`)
      return
    }
    const roles = message.member?.roles.cache.map(x => x.name.toLowerCase()) || []

    if (!this.hasCommandAccess(roles, commandToRun.id)) {
      console.log('no access to command')
      message.reply(`You do not have access to the \`${commandToRun.id}\` command`)
      return
    }

    if (instance === '*') {
      // from the global channel
      console.log('from a main channel')
    } else {
      console.log('from bridge channel', instance)
      if (commandToRun.flags.instance) {
        args.splice(1, 0, instance)
      }
    }

    this.emit('run-command', {args, message})
  }

  hasCommandAccess(roles: string[], commandId: string): boolean {
    roles = ['*', ...roles]
    return roles.some(role => {
      const cmdList = this.config.discord.permissions[role]?.commands || []
      return cmdList.includes('*') || cmdList.includes(commandId)
    })
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
