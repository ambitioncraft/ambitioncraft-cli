import {LocalInstance, LocalInstanceSettings} from './instance/local-instance'
import {CliConfig} from './config'
import * as utils from './utils'
import fs from 'fs'
import Path from 'path'
import {InstanceInfo, InstanceSettings} from './instance/instance-info'
import {RemoteInstance, RemoteInstanceSettings} from './instance/remote-instance'

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
    const isLocal = fs.existsSync(path)

    if (isLocal) {
      const settings = {name: name} as LocalInstanceSettings
      const props = utils.minecraft.readServerProperties(Path.join(path, 'server.properties'))
      settings.path = path
      settings.host = '127.0.0.1'
      settings.port = props['server-port']
      settings.rconPort = props['rcon.port']
      settings.rconPass = props['rcon.password'] || ''
      return new LocalInstance(settings)
    }

    const props = this.config.remoteServers.find(x => x.name === name)
    if (!props) {
      return undefined
    }
    const settings = {
      name: name,
      panelUrl: props.panelUrl,
      host: props.host,
      port: props.serverPort,
      rconPort: props.rconPort,
      rconPass: props.rconPass,
      uuid: props.uuid,
      userApiKey: props.userApiKey,
    }

    return new RemoteInstance(settings)
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

