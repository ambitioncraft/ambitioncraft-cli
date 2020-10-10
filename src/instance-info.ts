import Path from 'path'
import config from './config.json'
import {Rcon} from 'rcon-client'
import shelljs from 'shelljs'
import fs from 'fs'
import * as utils from './utils/instance-utils'
import {notDeepEqual} from 'assert'

type InstanceSettings = {
  name: string;
  path: string;
  rconPort: number;
  rconPass: string;
  host: string;
  isLocal: boolean;
}

export class InstanceInfo {
  name: string
  rconPort: number
  rconPass: string
  host: string
  isLocal: boolean
  path: string
  private rcon: Rcon | undefined

  constructor({name, host, rconPort, rconPass, path, isLocal}: InstanceSettings) {
    this.name = name
    this.rconPort = rconPort
    this.rconPass = rconPass
    this.host = host
    this.isLocal = isLocal
    this.path = path
  }

  static findInstance(name: string): InstanceInfo | undefined {
    const path = Path.join(config.directories.instances, name)
    const settings = {name: name} as InstanceSettings
    settings.isLocal = fs.existsSync(path)

    if (settings.isLocal) {
      settings.path = path
      const props = utils.readMinecraftServerProperties(Path.join(path, 'server.properties'))
      settings.host = '127.0.0.1'
      settings.rconPort = props['rcon.port']
      settings.rconPass = props['rcon.password'] || ''
    } else {
      const props = config.remoteServers.find(x => x.id === name)
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

  private async getRcon() {
    if (this.rcon && this.rcon.authenticated) {
      return this.rcon
    }

    if (this.isLocal && this.getServiceStatus() === InstanceStatus.Inactive) {
      throw new Error('service is not online')
    }

    const rcon = await Rcon.connect({
      host: this.host, port: this.rconPort, password: this.rconPass,
    })

    this.rcon = rcon
    return rcon
  }

  async sendRconCommand(command: string): Promise<string> {
    const rcon = await this.getRcon()
    return await rcon.send(command)
  }

  getServiceStatus() {
    return InstanceInfo.getServiceStatus(this.name)
  }

  async isRconConnected() {
    try {
      await this.sendRconCommand('list')
      return true
    } catch {
      return false
    }
  }

  async canPing() {
    // todo add ping code check here :)
    const host = this.host
    // await call to host
    // return true or false if can ping or not
    // No need to retry here, the thing calling this method will be responsible for retrying.
    throw new Error('Not Implemented')
  }

  static getServiceStatus(instanceName: string): InstanceStatus {
    const command = `${config['mc-service']} is-active ${instanceName}`
    const result = shelljs.exec(command, {silent: true}).trim()
    if (result === 'active') {
      return InstanceStatus.Active
    }
    return InstanceStatus.Inactive
  }
}

function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key
    return res
  }, Object.create(null))
}
export const InstanceStatus = strEnum([
  'NotFound',
  'Active',
  'Inactive',
  'Failed',
])
export type InstanceStatus = keyof typeof InstanceStatus
