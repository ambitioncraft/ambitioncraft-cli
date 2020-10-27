export interface CliConfig {
  directories: Directories;
  instanceAliases: { [key: string]: string };
  mcService: string;
  realms: {[key: string]: LocalRealmConfig | RemoteRealmConfig };
  // remoteServers: RemoteServer[];
}

export type LocalRealmConfig = {
  provider: 'local';
  path: string;
}

export type RemoteRealmConfig = {
  provider: 'pterodactyl';
  panelUrl: string;
  host: string;
  uuid: string;
  userApiKey: string;
}

export type Directories = {
  images: string;
  instances: string;
  scripts: string;
}

// export type RemoteServer = {
//   panelUrl: string;
//   name: string;
//   host: string;
//   uuid: string;
//   userApiKey: string;
//   serverPort: number;
//   rconPass: string;
//   rconPort: number;
// }

