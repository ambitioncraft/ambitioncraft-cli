import {Help, HelpOptions} from '@oclif/plugin-help'
import * as Config from '@oclif/config'
import stripAnsi = require('strip-ansi')
import CommandContext from './command-context'
export default class CustomHelp extends Help {
  context: CommandContext | undefined
  constructor(config: Config.IConfig, opts?: Partial<HelpOptions> | undefined) {
    super(config, opts)
    this.opts.stripAnsi = true
    this.opts.all = true
    this.context = (config as any).run_context
    this.context?.commandResponse.setColorCustom('0x7ff1e9')
  }

  log(message: string) {
    if (this.context?.commandPrefix) {
      message = message.replace(/\$ mc /gm, this.context.commandPrefix)
    }
    this.context?.commandResponse.info(message.trim())
    console.log(message)
  }

  public showCommandHelp(command: Config.Command) {
    const name = command.id
    const depth = name.split(':').length

    const subTopics = this.sortedTopics.filter(t => t.name.startsWith(name + ':') && t.name.split(':').length === depth + 1)
    const subCommands = this.sortedCommands.filter(c => c.id.startsWith(name + ':') && c.id.split(':').length === depth + 1)

    const title = command.description && this.render(command.description).split('\n')[0]
    if (title) this.log(title + '\n')
    this.log(this.formatCommand(command))
    this.log('')

    if (subTopics.length > 0) {
      this.log(this.formatTopics(subTopics))
      this.log('')
    }

    if (subCommands.length > 0) {
      this.log(this.formatCommands(subCommands))
      this.log('')
    }
  }

  protected showRootHelp() {
    this.context?.commandResponse.setTitle('**Main Help**')
    let rootTopics = this.sortedTopics
    let rootCommands = this.sortedCommands

    this.log(this.formatRoot())
    this.log('')

    if (!this.opts.all) {
      rootTopics = rootTopics.filter(t => !t.name.includes(':'))
      rootCommands = rootCommands.filter(c => !c.id.includes(':'))
    }

    if (rootTopics.length > 0) {
      this.log(this.formatTopics(rootTopics))
      this.log('')
    }

    if (rootCommands.length > 0) {
      rootCommands = rootCommands.filter(c => c.id)
      this.log(this.formatCommands(rootCommands))
      this.log('')
    }
  }

  protected showTopicHelp(topic: Config.Topic) {
    const name = topic.name
    const depth = name.split(':').length

    const subTopics = this.sortedTopics.filter(t => t.name.startsWith(name + ':') && t.name.split(':').length === depth + 1)
    const commands = this.sortedCommands.filter(c => c.id.startsWith(name + ':') && c.id.split(':').length === depth + 1)

    this.log(this.formatTopic(topic))

    if (subTopics.length > 0) {
      this.log(this.formatTopics(subTopics))
      this.log('')
    }

    if (commands.length > 0) {
      this.log(this.formatCommands(commands))
      this.log('')
    }
  }

  protected formatCommands(commands: Config.Command[]): string {
    let output = super.formatCommands(commands)
    if (this.opts.stripAnsi) output = stripAnsi(output)
    return output
  }

  protected formatRoot() {
    const root = super.formatRoot()
    // strip root and version, no need for it.
    // add our own custom header.
    return root.substring(root.indexOf('USAGE')).trim()
  }
}
