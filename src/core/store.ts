import {CliConfig} from '../config'
import {McServer} from '../mc-server/mc-server'
import {PterodactylServer} from '../mc-server/pterodactyl-instance'

export class Store {
  config: CliConfig
  constructor(config: CliConfig) {
    this.config = config
  }

  loadConfig(config: CliConfig) {
    this.config = config
  }

  private servers: Record<string, McServer> = {}
  async getMcServer(name: string): Promise<McServer | undefined> {
    if (!this.servers[name]) {
      const realm = await this.findMcServer(name)
      if (!realm) return undefined
      this.servers[name] = realm
    }
    return this.servers[name]
  }

  private async findMcServer(name: string): Promise<McServer | undefined> {
    const realmConfig = this.config.servers[name]
    switch (realmConfig?.provider) {
    // case 'local':
    //   return LocalRealm.createFromConfig(name, realmConfig)
    case 'pterodactyl':
      return await PterodactylServer.createFromConfig(name, realmConfig)
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
