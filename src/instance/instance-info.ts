import {Rcon} from 'rcon-client'
import {MinecraftProperties} from '../utils/minecraft'

export interface InstanceSettings {
  name: string;
  host: string;
  port: number;
  rconPort: number;
  rconPass: string;
}

export abstract class InstanceInfo {
  name: string
  port: number
  rconPort: number
  rconPass: string
  host: string
  protected rcon: Rcon | undefined

  constructor({name, host, port, rconPort, rconPass}: InstanceSettings) {
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

  async isReady() {
    try {
      await this.sendRconCommand('say ping')
      return true
    } catch {
      return false
    }
  }

  abstract getMinecraftProperties(): Promise<MinecraftProperties>
  abstract setMinecraftProperties(props: MinecraftProperties): Promise<void>
  abstract start(): Promise<void>
  abstract stop(): Promise<void>
  abstract status(): Promise<InstanceStatus>
  abstract getDirListing(): Promise<string[]>
}

function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key
    return res
  }, Object.create(null))
}
export const InstanceStatus = strEnum([
  'unknown',
  'running',
  'starting',
  'stopping',
  'offline',
])
export type InstanceStatus = keyof typeof InstanceStatus
