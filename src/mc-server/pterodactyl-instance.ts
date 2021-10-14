import Path from 'path'
import {Rcon} from 'rcon-client'
import store from '../core/store'

import PanelUserClient from '../panel/user-client/client'
import getServerResourceUsage from '../panel/user-client/server/getServerResourceUsage'
import sendPowerState from '../panel/user-client/server/sendPowerState'
import {MinecraftProperties} from '../utils/minecraft'
import * as utils from '../utils'
import getFileContents from '../panel/user-client/server/files/getFileContents'
import saveFileContents from '../panel/user-client/server/files/saveFileContents'
import downloadFile from '../panel/user-client/server/files/downloadFile'
import loadDirectory from '../panel/user-client/server/files/loadDirectory'
import {PterodactylConfig} from '../config'
import {McServer, McServerSettings, ServerStatus} from './mc-server'
import copyFile from '../panel/user-client/server/files/copyFile'
import renameFiles from '../panel/user-client/server/files/renameFiles'
import {AxiosInstance} from 'axios'

export interface PterodactylMcServerSettings extends McServerSettings {
  uuid: string;

}

export class PterodactylServer extends McServer {
  client: PanelUserClient
  config: PterodactylMcServerSettings

  public get uuid(): string {
    return this.config.uuid
  }

  public get http(): AxiosInstance {
    return this.client.http
  }

  constructor(client: PanelUserClient, config: PterodactylMcServerSettings) {
    super(config)
    this.client = client
    this.config = config
  }

  static async createFromConfig(name: string, config: PterodactylConfig): Promise<McServer | undefined> {
    // create the client
    const client = await PanelUserClient.create(config.panelUrl, config.userApiKey)
    const text = await getFileContents(client.http, config.uuid, 'server.properties')
    const props = utils.minecraft.parseServerProperties(text)
    return new PterodactylServer(client, {
      host: config.host,
      name: name,
      port: props['server-port'],
      rconPort: props['rcon.port'],
      rconPass: props['rcon.password'] || '',
      uuid: config.uuid,
      worldDir: config.worldDir,
      backupDir: config.backupDir,
      mirrorServer: config.mirrorServer,
    })
  }

  async getMinecraftProperties(instanceDir: string): Promise<MinecraftProperties> {
    const file = Path.join(instanceDir, 'server.properties')
    const text = await getFileContents(this.http, this.uuid, file)
    return utils.minecraft.parseServerProperties(text)
  }

  async setMinecraftProperties(props: MinecraftProperties, instanceDir: string): Promise<void> {
    const file = Path.join(instanceDir, 'server.properties')
    const text = utils.minecraft.flattenServerProperties(props)
    await saveFileContents(this.http, this.uuid, file, text)
  }

  async status(): Promise<ServerStatus> {
    const state = await getServerResourceUsage(this.http, this.uuid)
    return state.status
  }

  async start() {
    await sendPowerState(this.http, this.uuid, 'start')
  }

  async stop() {
    // await this.sendRconCommand('stop')
    await sendPowerState(this.http, this.uuid, 'stop')
  }

  async forceKill() {
    await sendPowerState(this.http, this.uuid, 'kill')
  }

  async getDirListing(path: string): Promise<string[]> {
    const files = await loadDirectory(this.http, this.uuid, path)
    return files.map(x => x.name)
  }

  async downloadFile(path: string): Promise<Buffer> {
    return await downloadFile(this.http, this.uuid, path)
  }

  async uploadFile(path: string, content: any): Promise<void> {
    await saveFileContents(this.http, this.uuid, path, content)
  }

  async renameFiles(root: string, from: string, to: string): Promise<void> {
    await renameFiles(this.http, this.uuid, root, [{from, to}])
  }
}

