import Path from 'path'
import {Rcon} from 'rcon-client'
import shelljs from 'shelljs'
import fs from 'fs'
import {minecraft} from './utils'
import store from './store'

export type InstanceSettings = {
  name: string;
  path: string;
  rconPort: number;
  rconPass: string;
  host: string;
  isLocal: boolean;
  mcService: string;
}

export class InstanceInfo {
  name: string
  rconPort: number
  rconPass: string
  host: string
  isLocal: boolean
  path: string
  mcService: string
  private rcon: Rcon | undefined

  constructor({name, host, rconPort, rconPass, path, isLocal, mcService}: InstanceSettings) {
    this.name = name
    this.rconPort = rconPort
    this.rconPass = rconPass
    this.host = host
    this.isLocal = isLocal
    this.path = path
    this.mcService = mcService
  }

  getMinecraftProperties() {
    return minecraft.readServerProperties(Path.join(this.path, 'server.properties'))
  }

  setMinecraftProperties(props: minecraft.MinecraftProperties) {
    minecraft.writeServerProperties(Path.join(this.path, 'server.properties'), props)
  }

  private async getRcon() {
    if (this.rcon && this.rcon.authenticated) {
      return this.rcon
    }

    if (this.isLocal && this.status() === InstanceStatus.Inactive) {
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
    await Promise.resolve()
    throw new Error('Not Implemented')
  }

  status(): InstanceStatus {
    const command = `${this.mcService} is-active ${this.name}`
    const result = shelljs.exec(command, {silent: true}).trim()
    if (result === 'active') {
      return InstanceStatus.Active
    }
    return InstanceStatus.Inactive
  }

  start() {
    const command = `${this.mcService} start ${this.name}`
    const result = shelljs.exec(command, {silent: true})
  }

  async stop() {
    if (this.isLocal) {
      const command = `${this.mcService} stop ${this.name}`
      const result = shelljs.exec(command, {silent: true})
    } else {
      await this.sendRconCommand('stop')
    }
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
