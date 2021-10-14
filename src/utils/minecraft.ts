import fs from 'fs'
import Path from 'path'

export function parseServerProperties(text: string) {
  const props = {} as MinecraftProperties
  text.split(/\r?\n/).forEach(l => {
    if (l.trim().startsWith('#')) {
      return
    }
    const k = l.substring(0, l.indexOf('='))
    const v = l.substring(l.indexOf('=') + 1)
    if (k.length > 1) {
      props[k] = v
    }
  })
  return props
}

export function getRegionPath(demension: 'overworld' | 'nether' | 'end', region: string) {
  const validation = /^-?[\d]+\.-?[\d]+$/
  region = region.trim()
  if (!region.match(validation)) {
    throw new Error(`invalid region ${region}`)
  }
  const file = `r.${region}.mca`
  let regionDir = ''
  if (demension === 'overworld') {
    regionDir = Path.join('world', 'region')
  } else if (demension === 'nether') {
    regionDir = Path.join('world', 'DIM-1', 'region')
  } else if (demension === 'end') {
    regionDir = Path.join('world', 'DIM1', 'region')
  }
  return Path.join(regionDir, file)
}

export function flattenServerProperties(props: MinecraftProperties) {
  const lines: string[] = []
  Object.keys(props).forEach(k => lines.push(`${k}=${props[k]}`))
  return lines.join('\r\n')
}

export function readServerProperties(path: string): MinecraftProperties {
  const text = fs.readFileSync(path, 'utf8')
  return parseServerProperties(text)
}

export function writeServerProperties(path: string, props: MinecraftProperties) {
  const text = flattenServerProperties(props)
  fs.writeFileSync(path, text)
}

export type MinecraftProperties = {
  'allow-flight': boolean;
  'allow-nether': boolean;
  'broadcast-console-to-ops': boolean;
  'broadcast-rcon-to-ops': boolean;
  'difficulty': 'peacful' | 'easy' | 'normal' | 'hard';
  'enable-command-block': boolean;
  'enable-query': boolean;
  'enable-rcon': boolean;
  'enforce-whitelist': boolean;
  'force-gamemode': boolean;
  'function-permission-level': number;
  'gamemode': 'survival' | 'creative' | 'spectator' | 'adventure';
  'generate-structures': boolean;
  'generator-settings': string | undefined;
  'hardcore': boolean;
  'level-name': string;
  'level-seed': string | undefined;
  'level-type': string;
  'max-build-height': number;
  'max-players': number;
  'max-tick-time': number;
  'max-world-size': number;
  'motd': string;
  'network-compression-threshold': number;
  'online-mode': boolean;
  'op-permission-level': number;
  'player-idle-timeout': number;
  'prevent-proxy-connections': boolean;
  'pvp': boolean;
  'query.port': number;
  'rcon.password': string | undefined;
  'rcon.port': number;
  'resource-pack-sha1': string | undefined;
  'resource-pack': string | undefined;
  'server-ip': string | undefined;
  'server-port': number;
  'snooper-enabled': boolean;
  'spawn-animals': boolean;
  'spawn-monsters': boolean;
  'spawn-npcs': boolean;
  'spawn-protection': number;
  'use-native-transport': boolean;
  'view-distance': number;
  'white-list': boolean;
  [index: string]: any;
}
