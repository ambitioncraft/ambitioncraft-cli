import {Rcon} from 'rcon-client'
import {MinecraftProperties} from '../utils/minecraft'

export interface McServerSettings {
  name: string;
  host: string;
  port: number;
  rconPort: number;
  rconPass: string;
    worldDir: string | undefined;
  backupDir: string | undefined;
}

export abstract class McServer {
  name: string
  port: number
  rconPort: number
  rconPass: string
  host: string
  rcon: Rcon | undefined
  worldDir: string | undefined
  backupDir: string | undefined

  public get isLocal(): boolean {
    return this.worldDir !== undefined && this.worldDir.length > 1
  }

  constructor({name, host, port, rconPort, rconPass, worldDir, backupDir}: McServerSettings) {
    this.name = name
    this.port = port
    this.rconPort = rconPort
    this.rconPass = rconPass
    this.host = host
    this.worldDir = worldDir
    this.backupDir = backupDir
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

  async getState() {
    const status = await this.status()
    const isRconReady = await this.isRconReady()
    return {
      status,
      isRconReady,
    }
  }

  abstract getMinecraftProperties(instanceDir: string): Promise<MinecraftProperties>
  abstract setMinecraftProperties(props: MinecraftProperties, instanceDir: string): Promise<void>
  abstract start(): Promise<void>
  abstract stop(): Promise<void>
  abstract status(): Promise<ServerStatus>
  abstract getDirListing(path: string): Promise<string[]>
}

function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key
    return res
  }, Object.create(null))
}
export const ServerStatus = strEnum([
  'unknown',
  'running',
  'starting',
  'stopping',
  'offline',
])
export type ServerStatus = keyof typeof ServerStatus
