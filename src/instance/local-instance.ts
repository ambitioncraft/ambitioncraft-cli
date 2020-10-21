import Path from 'path'
import {Rcon} from 'rcon-client'
import shelljs from 'shelljs'
import fs from 'fs'
import {minecraft} from '../utils'
import store from '../store'
import {InstanceInfo, InstanceSettings, InstanceStatus} from './instance-info'

export interface LocalInstanceSettings extends InstanceSettings {
  path: string;
}

export class LocalInstance extends InstanceInfo {
  path: string
  constructor(settings: LocalInstanceSettings) {
    super(settings)
    this.path = settings.path
  }

  // eslint-disable-next-line require-await
  async getMinecraftProperties() {
    const props = minecraft.readServerProperties(Path.join(this.path, 'server.properties'))
    return props
  }

  // eslint-disable-next-line require-await
  async setMinecraftProperties(props: minecraft.MinecraftProperties) {
    minecraft.writeServerProperties(Path.join(this.path, 'server.properties'), props)
  }

  async status() {
    const command = `${store.config.mcService} is-active ${this.name}`
    const result = shelljs.exec(command, {silent: true}).trim()
    const status = result === 'active' ? InstanceStatus.running : InstanceStatus.offline
    return await Promise.resolve(status)
  }

  async start() {
    const command = `${store.config.mcService} start ${this.name}`
    const result = shelljs.exec(command, {silent: true})
    await Promise.resolve()
  }

  async stop() {
    const command = `${store.config.mcService} stop ${this.name}`
    const result = shelljs.exec(command, {silent: true})
    await Promise.resolve()
  }

  // eslint-disable-next-line require-await
  async getDirListing(): Promise<string[]> {
    return fs.readdirSync(Path.join(this.path))
  }
}

