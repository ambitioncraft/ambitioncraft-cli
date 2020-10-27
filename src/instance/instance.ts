/* eslint-disable no-useless-constructor */
import {RealmInfo} from '../realm/realm-info'
import {MinecraftProperties} from '../utils/minecraft'

export class Instance {
  public get fullName(): string {
    return `${this.realm.name}.${this.name}`
  }

  constructor(
    public name: string,
    public path: string,
    public isActiveInstance: boolean,
    public realm: RealmInfo) {

  }

  async getMinecraftProperties() {
    return await this.realm.getMinecraftProperties(this.path)
  }

  async setMinecraftProperties(props: MinecraftProperties) {
    await this.realm.setMinecraftProperties(props, this.path)
  }

  isReady() {
    return this.realm.isRconReady()
  }

  async isRunning() {
    if (!this.isActiveInstance) {
      return false
    }
    return await this.realm.isRunning()
  }

  async stop() {
    if (await this.isRunning()) {
      await this.realm.stop()
    } else {
      throw new Error(`instance: ${this.fullName} is not running`)
    }
  }

  async start() {
    if (await this.realm.isRunning()) {
      throw new Error('Server already running')
    } else {
      await this.realm.setActiveInstance(this.name)
      this.isActiveInstance = true
      await this.realm.start()
    }
  }
}
