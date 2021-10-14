import Discord, {MessageEmbed} from 'discord.js'
import {CliConfig} from '../config'
import {Config, IConfig, load} from '@oclif/config'
import CommandContext from '../core/command-context'
import CommandResponse, {Colors, loglevel} from '../core/command-response'
import {throttle} from '../utils'

let config: CliConfig
try {
  config = require('../../config.json') as CliConfig
} catch {
  throw new Error('config.json not found')
}

const logLevelIcon: Record<loglevel, string> = {
  info: '',
  success: '🟢 ',
  warn: '🟠 ',
  danger: '🔴 ',
  error: '🔴 ',
}

export default class DiscordCommandContext extends CommandContext {
  replyMessage?: Discord.Message
  commandPrefix = config.discord.commandPrefix
  source!: Discord.Message

  constructor(args: string[], source: Discord.Message) {
    super(args, source)
    const throttleLog = throttle(() => this.onLog(), 1000)
    this.commandResponse.on('log', () => throttleLog())
    this.commandResponse.on('flush', () => throttleLog.flush().then(() => this.onLog()))
  }

  async executeCommand(cmdConfig: Config | IConfig) {
    const commandText = this.args.join(' ')
    let title = `**${this.args[0]}** ${[...this.args].splice(1).join(' ')}`
    if (title.length > 45) {
      title = title.substring(0, 45) + '...'
    }
    this.commandResponse
    .setTitle(title)

    const embed = new Discord.MessageEmbed()
    .setTitle(this.commandResponse.title)
    .setDescription(codeBlock(`running command:${commandText}`))

    this.replyMessage = await this.source.reply(embed)
    await super.executeCommand(cmdConfig)
  }

  createChildContext(args: string[]) {
    return new DiscordCommandContext(args, this.source)
  }

  async onLog() {
    const content = createEmbed(this.commandResponse)
    if (this.replyMessage) {
      this.replyMessage?.edit(content)
    } else {
      this.replyMessage = await this.source.reply(content)
    }
  }
}

function createEmbed(commandResponse: CommandResponse) {
  const res = commandResponse
  const embed = new MessageEmbed()
  embed.setTitle(res.title)
  if (!res.customColor && res.color === Colors.DEFAULT) {
    if (res.hasWarning) {
      res.setColor(Colors.ORANGE)
    } else if (res.hasError) {
      res.setColor(Colors.RED)
    } else {
      res.setColor(Colors.BLUE)
    }
  }

  embed.setColor(res.customColor || res.color)

  if (res.title) {
    embed.setTitle(res.title)
  }

  if (res.description) {
    embed.setDescription(res.description)
  } else if (res.logs.length > 0) {
    embed.setDescription(codeBlock(
      res.logs.map(x => `${logLevelIcon[x.level]}${x.message}`).join('\n')
    ))
  }
  res.fields.forEach(f => {
    embed.addField(f.name, f.value, f.inline)
  })
  if (res.footer) {
    embed.setFooter(res.footer.text, res.footer.iconURL)
  }
  return embed
}

function codeBlock(text: string, language = '') {
  return '```' + language + '\n' + text + '\n```'
}
