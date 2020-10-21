import Path from 'path'
import {Rcon} from 'rcon-client'
import store from '../store'

import {InstanceInfo, InstanceSettings, InstanceStatus} from './instance-info'
import PanelUserClient from '../panel/user-client/client'
import getServerResourceUsage from '../panel/user-client/server/getServerResourceUsage'
import sendPowerState from '../panel/user-client/server/sendPowerState'
import {MinecraftProperties} from '../utils/minecraft'
import * as utils from '../utils'
import getFileContents from '../panel/user-client/server/files/getFileContents'
import saveFileContents from '../panel/user-client/server/files/saveFileContents'
import loadDirectory from '../panel/user-client/server/files/loadDirectory'

export interface RemoteInstanceSettings extends InstanceSettings{
  panelUrl: string;
  userApiKey: string;
  uuid: string;
}

export class RemoteInstance extends InstanceInfo {
  userApiKey: string
  client?: PanelUserClient
  uuid: string
  panelUrl: string
  constructor(settings: RemoteInstanceSettings) {
    super(settings)
    this.userApiKey = settings.userApiKey
    this.uuid = settings.uuid
    this.panelUrl = settings.panelUrl
  }

  async getMinecraftProperties(): Promise<MinecraftProperties> {
    const client = await this.getUserClient()
    const text = await getFileContents(client.http, this.uuid, 'server.properties')
    return utils.minecraft.parseServerProperties(text)
  }

  async setMinecraftProperties(props: MinecraftProperties): Promise<void> {
    const client = await this.getUserClient()
    const text = utils.minecraft.flattenServerProperties(props)
    await saveFileContents(client.http, this.uuid, 'server.properties', text)
  }

  async getUserClient() {
    if (!this.client) {
      this.client = await PanelUserClient.create(this.panelUrl, this.userApiKey)
    }
    return this.client
  }

  async isReady() {
    const status = await this.status()
    return status === 'running'
  }

  async status(): Promise<InstanceStatus> {
    const client = await this.getUserClient()
    const state = await getServerResourceUsage(client.http, this.uuid)
    return state.status
  }

  // eslint-disable-next-line require-await
  async start() {
    const client = await this.getUserClient()
    await sendPowerState(client.http, this.uuid, 'start')
  }

  async stop() {
    const client = await this.getUserClient()
    const resp = await sendPowerState(client.http, this.uuid, 'stop')
  }

  async getDirListing(): Promise<string[]> {
    const client = await this.getUserClient()
    const files = await loadDirectory(client.http, this.uuid, '/')
    return files.map(x => x.name)
  }
}

