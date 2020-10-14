import config from './config.json'

export default config as AppConfig.Config

export namespace AppConfig {
  export type Config = {
    directories: Directories;
    discord: Discord;
    instanceAliases: { [key: string]: string };
    mcService: string;
    remoteServers: RemoteServer[];
  }

  export type Directories = {
    images: string;
    instances: string;
    scripts: string;
  }

  export type Discord = {
    channels: { [key: string]: string };
    commandPrefix: string;
    token: string;
    roles: {
      [tagName: string]: {
        commands: string[];
      };
      '*': {
        commands: string[];
      };
    };
  }
  export type RemoteServer = {
    displayName: string;
    host: string;
    id: string;
    rconPass: string;
    rconPort: number;
  }
}
