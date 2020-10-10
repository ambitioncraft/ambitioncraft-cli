import {string} from '@oclif/command/lib/flags'
import {Rcon} from 'rcon-client'
import {config} from 'shelljs'
import {InstanceInfo} from './instance-info'

export class Store {
  instances: Record<string, InstanceInfo> = {}
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
}
const store = new Store()
export default store

