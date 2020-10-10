import CommandContext, {user} from '../command-context'

import Discord, {MessageEmbed} from 'discord.js'
import CommandResponse, {Colors, loglevel} from '../command-response'
import throttle from '../utils/throttle'
import {Config, IConfig} from '@oclif/config/lib/config'

const logLevelIcon: Record<loglevel, string> = {
  info: '',
  success: '🟢',
  warn: '🟠',
  danger: '🔴',
  error: '🔴',
}

export default class DiscordCommandContext extends CommandContext {
  replyMessage?: Discord.Message
  constructor(public sourceMessage: Discord.Message, args: string[], user?: user) {
    super(args, user)
    const throttleLog = throttle(() => this.onLog(), 500)
    this.commandResponse.on('log', () => throttleLog())
    this.commandResponse.on('flush', () => throttleLog.flush().then(() => this.onLog()))
  }

  async executeCommand(cmdConfig: Config | IConfig) {
    const commandText = this.args.join(' ')
    this.replyMessage = await this.sourceMessage.channel.send(codeBlock(`running command:${commandText}`))
    await super.executeCommand(cmdConfig)
  }

  async onLog() {
    let content
    if (this.commandResponse.isEmbed) {
      content = createEmbed(this.commandResponse)
    } else {
      content = codeBlock(
        this.commandResponse.logs.map(x => `${logLevelIcon[x.level]} ${x.message}`).join('\n')
      )
    }
    if (this.replyMessage) {
      await this.replyMessage.edit(content)
    } else {
      this.replyMessage = await this.sourceMessage.channel.send(content)
    }
    console.log('done')
  }
}

function createEmbed(commandResponse: CommandResponse) {
  const res = commandResponse
  const embed = new MessageEmbed()
  embed.title = res.title
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
    embed.setDescription(codeBlock(res.logs.map(x => x.message).join('\n')))
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
