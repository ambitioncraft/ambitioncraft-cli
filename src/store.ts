import {string} from '@oclif/command/lib/flags'
import {Rcon} from 'rcon-client'
import {InstanceInfo} from './instance-info'
import config from './config.json'
import fs from 'fs'
export class Store {
  private instances: Record<string, InstanceInfo> = {}
  getInstanceInfo(instanceName: string) {
    if (!this.instances[instanceName]) {
      const instance = InstanceInfo.findInstance(instanceName)
      if (!instance) {
        return undefined
      }
      this.instances[instanceName] = instance
    }
    return this.instances[instanceName]
  }

  getAllInstances(): InstanceInfo[] {
    return fs.readdirSync(config.directories.instances, {withFileTypes: true})
    .filter(dir => dir.isDirectory())
    .map(dir => this.getInstanceInfo(dir.name))
    .filter(x => x) as InstanceInfo[]
  }
}
const store = new Store()
export default store

