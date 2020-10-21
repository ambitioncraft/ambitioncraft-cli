export interface CliConfig {
  directories: Directories;
  instanceAliases: { [key: string]: string };
  mcService: string;
  remoteServers: RemoteServer[];
}

export type Directories = {
  images: string;
  instances: string;
  scripts: string;
}

export type RemoteServer = {
  panelUrl: string;
  name: string;
  host: string;
  uuid: string;
  userApiKey: string;
  serverPort: number;
  rconPass: string;
  rconPort: number;
}

