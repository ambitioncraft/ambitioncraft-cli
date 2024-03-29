import {Rcon} from 'rcon-client'
import store from '../core/store'
import {MinecraftProperties} from '../utils/minecraft'
import retry from 'async-retry'
export interface McServerSettings {
  name: string;
  host: string;
  port: number;
  rconPort: number;
  rconPass: string;
  worldDir: string | undefined;
  backupDir: string | undefined;
  mirrorServer: string | undefined;
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
  mirrorServer: string | undefined

  public get isLocal(): boolean {
    return this.worldDir !== undefined && this.worldDir.length > 1
  }

  constructor({name, host, port, rconPort, rconPass, worldDir, backupDir, mirrorServer}: McServerSettings) {
    this.name = name
    this.port = port
    this.rconPort = rconPort
    this.rconPass = rconPass
    this.host = host
    this.worldDir = worldDir
    this.backupDir = backupDir
    this.mirrorServer = mirrorServer
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
  abstract forceKill(): Promise<void>
  abstract uploadFile(path: string, contents: any): Promise<void>
  abstract downloadFile(path: string): Promise<Buffer>
  abstract renameFiles(root: string, from: string, to: string): Promise<void>
  abstract status(): Promise<ServerStatus>
  abstract getDirListing(path: string): Promise<string[]>

  async getMirrorInstance() {
    if (this.mirrorServer) {
      return await store.getMcServer(this.mirrorServer)
    }
  }
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

export async function stopInstance(instance: McServer, forceKill: boolean) {
  try {
    await fnStopServer(instance, false)
  } catch (error) {
    if (forceKill) {
      await fnStopServer(instance, true)
    } else {
      throw error
    }
  }
}
async function fnStopServer(instance: McServer, forceKill: boolean) {
  forceKill ? await instance.forceKill() : await instance.stop()
  await retry(async _abort => {
    const result = (await instance.status()) === 'offline'
    if (!result) throw new Error('not stopped yet...')
    return result
  }, {
    maxRetryTime: 20000,
    minTimeout: 2000,
    maxTimeout: 5000,
    onRetry: (_e, i) => {
      console.log(`attempting to ${forceKill ? 'kill' : 'stop'}... attempt: ${i}`)
    },
  })
}

export async function startInstance(instance: McServer) {
  await instance.start()
  await retry(async bail => {
    const result = (await instance.status()) === 'running'
    if (!result) throw new Error('not started yet...')
    return result
  }, {
    maxRetryTime: 60000,
    minTimeout: 2000,
    maxTimeout: 5000,
    onRetry: (e, i) => {
      console.log(`attempting to connect... attempt: ${i}`)
    },
  })
}
