import {InstanceInfo, InstanceSettings} from './instance-info'
import {CliConfig} from './config'
import * as utils from './utils'
import fs from 'fs'
import Path from 'path'

export class Store {
  config: CliConfig
  constructor(config: CliConfig) {
    this.config = config
  }

  loadConfig(config: CliConfig) {
    this.config = config
  }

  private instances: Record<string, InstanceInfo> = {}
  getInstanceInfo(instanceName: string) {
    if (!this.instances[instanceName]) {
      const instance = this.findInstance(instanceName)
      if (!instance) {
        return undefined
      }
      this.instances[instanceName] = instance
    }
    return this.instances[instanceName]
  }

  private findInstance(name: string): InstanceInfo | undefined {
    const path = Path.join(this.config.directories.instances, name)
    const settings = {name: name} as InstanceSettings
    settings.isLocal = fs.existsSync(path)

    if (settings.isLocal) {
      settings.path = path
      const props = utils.minecraft.readServerProperties(Path.join(path, 'server.properties'))
      settings.host = '127.0.0.1'
      settings.rconPort = props['rcon.port']
      settings.rconPass = props['rcon.password'] || ''
    } else {
      const props = this.config.remoteServers.find(x => x.id === name)
      if (!props) {
        return undefined
      }
      settings.isLocal = false
      settings.host = props.host
      settings.rconPort = props.rconPort
      settings.rconPass = props.rconPass
    }
    return new InstanceInfo(settings)
  }

  getAllInstances(): InstanceInfo[] {
    return fs.readdirSync(this.config.directories.instances, {withFileTypes: true})
    .filter(dir => dir.isDirectory())
    .map(dir => this.getInstanceInfo(dir.name))
    .filter(x => x) as InstanceInfo[]
  }
}

let config: CliConfig
try {
  config = require('../config.json') as CliConfig
} catch {
  throw new Error('config.json not found')
}
const store = new Store(config)
export default store

