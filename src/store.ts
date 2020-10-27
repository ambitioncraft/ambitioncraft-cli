import {LocalRealm, LocalRealmSettings} from './realm/local-realm'
import {CliConfig} from './config'
import {RealmInfo, RealmSettings} from './realm/realm-info'
import {RemoteRealm, RemoteRealmSettings} from './realm/remote-realm'

export class Store {
  config: CliConfig
  constructor(config: CliConfig) {
    this.config = config
  }

  loadConfig(config: CliConfig) {
    this.config = config
  }

  private realms: Record<string, RealmInfo> = {}
  async getRealm(name: string): Promise<RealmInfo | undefined> {
    if (!this.realms[name]) {
      const realm = await this.findRealm(name)
      if (!realm) return undefined
      this.realms[name] = realm
    }
    return this.realms[name]
  }

  private async findRealm(name: string): Promise<RealmInfo | undefined> {
    const realmConfig = this.config.realms[name]
    switch (realmConfig?.provider) {
    case 'local':
      return LocalRealm.createFromConfig(name, realmConfig)
    case 'pterodactyl':
      return await RemoteRealm.createFromConfig(name, realmConfig)
    default:
      return undefined
    }
  }
}

let config: CliConfig
try {
  config = require('../config.json') as CliConfig
} catch {
  throw new Error('config.json not found')
}
const store = new Store(config)
export default store
