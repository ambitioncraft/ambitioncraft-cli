
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import {InstanceCommandBase} from '../command-base'
import {Colors} from '../command-response'
import {InstanceInfo, InstanceStatus} from '../instance-info'
import * as utils from '../utils/instance-utils'
export default class McpropCommand extends InstanceCommandBase {
  static allowWithAll = true
  static description = 'change a setting in minecraft.properties'
  static examples = [
    '$ mc mcprop uhc level-name="my world"',
  ]

  static strict = false
  static flags: flags.Input<any> = {...InstanceCommandBase.flags}
  static args: Parser.args.IArg<any>[] = [...InstanceCommandBase.args]

  // eslint-disable-next-line require-await
  async run() {
    const props = this.instance.getMinecraftProperties()
    const args = [...this.argv.splice(1)]
    const propKeys = Object.keys(props)
    args.forEach(a => {
      const propName = a.substr(0, a.indexOf('='))
      const value = a.substr(a.indexOf('=') + 1)
      if (!propKeys.includes(propName)) {
        this.error(`${propName} is not a valid server property`)
      }
      this.console(`${propName} set to ${value}`)
      props[propName] = value
    })
    this.instance.setMinecraftProperties(props)
    this.info(`${this.instanceName} server.properties updated`)
  }
}
