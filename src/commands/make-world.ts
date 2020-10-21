/* eslint-disable no-console */

import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import fs from 'fs'
import Path from 'path'
import {McCommand, InstanceCommandBase} from '../command-base'
import {InstanceInfo, InstanceStatus} from '../instance/instance-info'
import {LocalInstance, RemoteInstance} from '..'
import loadDirectory from '../panel/user-client/server/files/loadDirectory'
import compressFiles from '../panel/user-client/server/files/compressFiles'
import renameFiles from '../panel/user-client/server/files/renameFiles'
import decompressFiles from '../panel/user-client/server/files/decompressFiles'
import deleteFiles from '../panel/user-client/server/files/deleteFiles'
import createDirectory from '../panel/user-client/server/files/createDirectory'

export class MakeWorldCommand extends InstanceCommandBase {
  static allowWithAll = false
  static aliases = ['mkworld']
  static description = 'Create a new world on the same server.'

  static examples = [
    '$ mc make-world uhc MyWorld --seed=19094829123',
    '$ mc make-world speedrun setseedworld --temp',
    '$ mc make-world speedrun setseedworld --temp --remake',
    '$ mc mkworld speedrun setseedworld -tr',
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
    remake: flags.boolean({char: 'r', description: 'remake the current world. This can only be done if the world was flagged as temporary'}),
    // flag with a value (-s, --seed=VALUE)
    seed: flags.string({char: 's', description: 'seed of new world'}),
    // flag with no value (-t, --temp)
    temp: flags.boolean({char: 't', description: 'helper to indicate this world is only temporary'}),
  }

  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
    {name: 'worldName', required: true, description: 'Name of the new world'},
  ]

  // eslint-disable-next-line require-await
  async run() {
    const {worldName} = this.args
    const {seed = '', remake = false, temp = false} = this.flags
    const status = await this.instance.status()
    if (status !== InstanceStatus.offline) {
      this.error(`Instance: ${this.instanceName} is not offline`)
    }
    makeWorld(this.instance, {worldName, seed, remake, temp}, this)
    await Promise.resolve()
  }
}

export async function makeWorld(instance: InstanceInfo, {worldName = 'world', seed = '', temp = false, remake = false}, cmd: McCommand) {
  let prefix = ''
  if (!worldName.startsWith('world_')) {
    prefix += 'world_'
  }
  if (temp && !worldName.includes('temp_')) {
    prefix += 'temp_'
  }
  const desiredWorldName = `${prefix}${worldName}`
  let levelName = desiredWorldName
  if (instance instanceof LocalInstance) {
    levelName = makeLocalWorldFolder(instance, desiredWorldName)
  } else if (instance instanceof RemoteInstance) {
    levelName = await makeRemoteWorldFolder(instance, desiredWorldName)
  } else {
    cmd.error('NOPE!')
  }

  if (levelName !== desiredWorldName) {
    cmd.info(`${desiredWorldName} already exists, using ${levelName} instead.`)
  }

  cmd.info(`Created dir ${levelName}`)
  cmd.info(`Coppied contents of WORLD.TEMPLATE to ${levelName}`)

  cmd.info('Modifying minecraft server.properties')
  const props = await instance.getMinecraftProperties()
  props['level-name'] = levelName
  if (!remake) {
    props['level-seed'] = seed
  }
  await instance.setMinecraftProperties(props)
  cmd.info(`Created new world: ${levelName}`)
}

function getNextLevelName(desiredWorldName: string, dirListing: string[]): string {
  let count = 1
  // check to see if the world already exists, if so, increment the level name
  let levelName = `${desiredWorldName}`
  while (dirListing.some(x => x === levelName)) {
    levelName = `${desiredWorldName}(${count})`
    count++
  }
  return levelName
}

export function makeLocalWorldFolder(instance: LocalInstance, desiredWorldName: string) {
  const serverpath = instance.path
  const dirListing = fs.readdirSync(Path.join(serverpath))
  const levelName = getNextLevelName(desiredWorldName, dirListing)

  const levelPath = Path.join(serverpath, levelName)
  fs.mkdirSync(levelPath)
  shell.cp('-r', Path.join(serverpath, 'WORLD.TEMPLATE/*'), levelPath)
  return levelName
}

export async function makeRemoteWorldFolder(instance: RemoteInstance, desiredWorldName: string) {
  const client = await instance.getUserClient()
  const {http} = client
  const {uuid} = instance

  const files = await loadDirectory(http, uuid, '/')
  const levelName = getNextLevelName(desiredWorldName, files.map(x => x.name))

  const response = await compressFiles(http, uuid, '/', ['WORLD.TEMPLATE'])
  console.log('compressed WORLD.TEMPLATE')

  await renameFiles(http, uuid, '/', [{from: 'WORLD.TEMPLATE', to: levelName}])
  console.log('renamed WORLD.TEMPLATE to actual world name')

  await (decompressFiles(http, uuid, '/', response.name))
  console.log('restored WORLD.TEMPLATE')

  await (deleteFiles(http, uuid, '/', [response.name]))
  console.log('removed temp archive')

  return levelName
}
