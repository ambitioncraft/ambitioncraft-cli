import {Rcon} from 'rcon-client'
import {Instance} from '../instance/instance'
import {MinecraftProperties} from '../utils/minecraft'

export interface RealmSettings {
  name: string;
  host: string;
  port: number;
  rconPort: number;
  rconPass: string;
}

export abstract class RealmInfo {
  name: string
  port: number
  rconPort: number
  rconPass: string
  host: string
  rcon: Rcon | undefined

  constructor({name, host, port, rconPort, rconPass}: RealmSettings) {
    this.name = name
    this.port = port
    this.rconPort = rconPort
    this.rconPass = rconPass
    this.host = host
  }

  protected async getRcon() {
    if (this.rcon && this.rcon.authenticated) {
      return this.rcon
    }

    const rcon = await Rcon.connect({
      host: this.host, port: this.rconPort, password: this.rconPass,
    })

    this.rcon = rcon
    return rcon
  }

  async sendRconCommand(command: string): Promise<string> {
    const rcon = await this.getRcon()
    const result = await rcon.send(command)
    return result
  }

  async isRconReady() {
    try {
      await this.sendRconCommand('say ping')
      return true
    } catch {
      return false
    }
  }

  async isRunning() {
    const status = await this.status()
    return status !== 'offline'
  }

  async getInstance(instanceName: string) {
    // handle blank instance names, which would just be root single instances
    const instances = await this.getAllInstances()
    const activeInstance = await this.getActiveInstance()
    if (instances.includes(instanceName)) {
      const path = `instances/${instanceName}`
      const isActiveInstance = activeInstance === instanceName
      return new Instance(instanceName, path, isActiveInstance, this)
    }
  }

  async getState() {
    const status = await this.status()
    const isRconReady = await this.isRconReady()
    const activeInstance = await this.getActiveInstance()
    const allInstances = await this.getAllInstances()
    return {
      status,
      isRconReady,
      activeInstance,
      allInstances,
    }
  }

  async getAllInstances() {
    return await this.getDirListing('/instances/')
  }

  abstract getMinecraftProperties(instanceDir: string): Promise<MinecraftProperties>
  abstract setMinecraftProperties(props: MinecraftProperties, instanceDir: string): Promise<void>
  abstract getActiveInstance(): Promise<string>
  abstract setActiveInstance(name: string): Promise<void>

  abstract start(): Promise<void>
  abstract stop(): Promise<void>
  abstract status(): Promise<RealmStatus>
  abstract getDirListing(path: string): Promise<string[]>
}

function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key
    return res
  }, Object.create(null))
}
export const RealmStatus = strEnum([
  'unknown',
  'running',
  'starting',
  'stopping',
  'offline',
])
export type RealmStatus = keyof typeof RealmStatus
