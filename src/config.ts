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
  displayName: string;
  host: string;
  id: string;
  rconPass: string;
  rconPort: number;
}

