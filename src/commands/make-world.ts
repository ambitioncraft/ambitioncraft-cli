
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import fs, {write} from 'fs'
import Path from 'path'
import * as inquirer from 'inquirer'
import config from '../config.json'
import McCommand, {InstanceCommandBase} from '../command-base'
import * as utils from '../utils/instance-utils'

export class MakeWorldCommand extends InstanceCommandBase {
  static description = 'Create a new world on the same server.'

  static examples = [
    '$ mc make-world uhc MyWorld --seed=19094829123',
    '$ mc make-world speedrun setseedworld --temp',
    '$ mc make-world speedrun setseedworld --temp --remake',
    '$ mc make-world speedrun setseedworld -tr',
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
    const args = this.args
    const {seed = '', remake = false, temp = false} = this.flags

    const serverpath = Path.join(config.directories.instances, this.instanceName)
    const propertiesPath = Path.join(serverpath, 'server.properties')
    const props = utils.readMinecraftServerProperties(propertiesPath)

    let prefix = ''
    if (!args.worldName.startsWith('world_')) {
      prefix += 'world_'
    }
    if (temp && !args.worldName.includes('temp_')) {
      prefix += 'temp_'
    }

    let count = 1
    // check to see if the world already exists, if so, increment the level name
    let levelName = `${prefix}${args.worldName}`
    while (fs.existsSync(Path.join(serverpath, levelName))) {
      levelName = `${prefix}${args.worldName}(${count})`
      count++
    }

    if (levelName !== `${prefix}${args.worldName}`) {
      this.info(`${args.worldName} already exists, using ${levelName} instead.`)
    }

    const levelPath = Path.join(serverpath, levelName)
    fs.mkdirSync(levelPath)
    this.info(`Created dir ${levelName}`)

    shell.cp('-r', Path.join(serverpath, 'WORLD.TEMPLATE/*'), levelPath)
    this.info(`Coppied contents of WORLD.TEMPLATE to ${levelName}`)

    this.debug('Modifying minecraft server.properties')
    props['level-name'] = levelName

    if (!seed && remake) {
      props['level-seed'] = seed
    }

    utils.writeMinecraftServerProperties(propertiesPath, props)

    this.info(`Created new world: ${levelName}`)
  }
}

