import {CliConfig} from '../config'
import {Config, IConfig, load} from '@oclif/config'
import {EventEmitter} from 'events'

import readline from 'readline'
import CommandContext from '../core/command-context'
import store from '../core/store'

export abstract class CommandClientBase extends EventEmitter {
  commandConfig!: Config | IConfig;
  constructor(public config: CliConfig) {
    super()
    store.loadConfig(config)
  }

  async start(cb: () => void): Promise<void> {
    this.commandConfig = await load(__dirname)
    await this.onStart()
    this.emit('ready')
    cb.apply(this)
  }

  protected abstract onStart(): Promise<void>
  stop() {
    this.emit('close')
  }
}

export class ConsoleCommandClient extends CommandClientBase {
  constructor(public config: CliConfig) {
    super(config)
  }

  // eslint-disable-next-line require-await
  async onStart() {
    const rl = readline.createInterface(process.stdin, process.stdout)
    rl.on('line', line => this.onInput(line))
    rl.on('close', () => this.stop())
  }

  async onInput(line: string) {
    if (line.startsWith('.')) {
      const args = lineToArgs(line.substr(1))
      const context = new CommandContext(args)
      context.commandPrefix = '!'
      await context.executeCommand(this.commandConfig)
    }
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
