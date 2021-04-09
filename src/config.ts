export interface CliConfig {
  servers: {[key: string]: PterodactylConfig };
  discord: DiscordConfig;
}

export type PterodactylConfig = {
  provider: 'pterodactyl';
  panelUrl: string;
  host: string;
  uuid: string;
  userApiKey: string;
  worldDir: string | undefined;
  backupDir: string | undefined;
}

export type DiscordConfig = {
  channels: { [key: string]: string };
  commandPrefix: string;
  token: string;
  permissions: {
    [role: string]: {
      commands: string[];
    };
    '*': {
      commands: string[];
    };
  };
}
