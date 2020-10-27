import Path from 'path'
import {Rcon} from 'rcon-client'
import shelljs from 'shelljs'
import fs from 'fs'
import {minecraft} from '../utils'
import store from '../store'
import {RealmInfo, RealmSettings, RealmStatus} from './realm-info'
import {LocalRealmConfig} from '../config'

export interface LocalRealmSettings extends RealmSettings {
  path: string;
}

export class LocalRealm extends RealmInfo {
  path: string
  constructor(settings: LocalRealmSettings) {
    super(settings)
    this.path = settings.path
  }

  static createFromConfig(name: string, config: LocalRealmConfig): RealmInfo | undefined {
    // get the global properties
    const props = minecraft.readServerProperties(Path.join(config.path, 'global.properties'))
    return new LocalRealm({
      host: '127.0.0.1',
      name: name,
      path: config.path,
      port: props['server-port'],
      rconPass: props['rcon.password'] || '',
      rconPort: props['rcon.port'],
    })
  }

  // eslint-disable-next-line require-await
  async getMinecraftProperties(instanceDir: string) {
    const file = Path.join(this.path, instanceDir, 'server.properties')
    const props = minecraft.readServerProperties(file)
    return props
  }

  // eslint-disable-next-line require-await
  async setMinecraftProperties(props: minecraft.MinecraftProperties, instanceDir: string) {
    const file = Path.join(this.path, instanceDir, 'server.properties')
    minecraft.writeServerProperties(file, props)
  }

  // eslint-disable-next-line require-await
  async setActiveInstance(name: string): Promise<void> {
    fs.writeFileSync(Path.join(this.path, 'active_instance.txt'), name)
  }

  // eslint-disable-next-line require-await
  async getActiveInstance(): Promise<string> {
    const activeInstance = fs.readFileSync(Path.join(this.path, 'active_instance.txt'), 'utf8')
    return activeInstance.trim()
  }

  async status() {
    const command = `${store.config.mcService} is-active ${this.name}`
    const result = shelljs.exec(command, {silent: true}).trim()
    const status = result === 'active' ? RealmStatus.running : RealmStatus.offline
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
  async getDirListing(path: string): Promise<string[]> {
    return fs.readdirSync(Path.join(this.path, path))
  }
}

