
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import fs, {write} from 'fs'
import Path from 'path'
import * as inquirer from 'inquirer'
import config from '../config.json'
import McCommand, {InstanceCommandBase} from '../command-base'
import * as utils from '../utils/instance-utils'
import {InstanceInfo, InstanceStatus} from '../instance-info'
import CommandResponse from '../command-response'

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
    if (this.instance.getServiceStatus() === InstanceStatus.Active) {
      this.error(`Instance: ${this.instanceName} is currently active`)
    }
    makeWorld(this.instance.name, {worldName, seed, remake, temp}, this)
    await Promise.resolve()
  }
}

export function makeWorld(instanceName: string, {worldName = 'world', seed = '', temp = false, remake = false}, cmd: McCommand) {
  const serverpath = Path.join(config.directories.instances, instanceName)
  const propertiesPath = Path.join(serverpath, 'server.properties')
  const props = utils.readMinecraftServerProperties(propertiesPath)

  let prefix = ''
  if (!worldName.startsWith('world_')) {
    prefix += 'world_'
  }
  if (temp && !worldName.includes('temp_')) {
    prefix += 'temp_'
  }

  let count = 1
  // check to see if the world already exists, if so, increment the level name
  let levelName = `${prefix}${worldName}`
  while (fs.existsSync(Path.join(serverpath, levelName))) {
    levelName = `${prefix}${worldName}(${count})`
    count++
  }

  if (levelName !== `${prefix}${worldName}`) {
    cmd.info(`${worldName} already exists, using ${levelName} instead.`)
  }

  const levelPath = Path.join(serverpath, levelName)
  fs.mkdirSync(levelPath)
  cmd.info(`Created dir ${levelName}`)

  shell.cp('-r', Path.join(serverpath, 'WORLD.TEMPLATE/*'), levelPath)
  cmd.info(`Coppied contents of WORLD.TEMPLATE to ${levelName}`)

  cmd.info('Modifying minecraft server.properties')
  props['level-name'] = levelName

  if (!seed && remake) {
    props['level-seed'] = seed
  }

  utils.writeMinecraftServerProperties(propertiesPath, props)

  cmd.info(`Created new world: ${levelName}`)
}

