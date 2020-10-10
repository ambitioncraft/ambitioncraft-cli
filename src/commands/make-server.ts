
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import fs from 'fs'
import Path from 'path'
import * as inquirer from 'inquirer'
import config from '../config.json'
import McCommand from '../command-base'

const versions = fs.readdirSync('/opt/minecraft/images/').filter(x => x !== 'common')
export class MakeServerCommand extends McCommand {
  static description = 'Create a new Minecraft server instance.'

  static examples = [
    '$ mc make-server',
    '$ mc make-server uhc',
    '$ mc make-server uhc --version=1.16.2',
  ]

  static flags: flags.Input<any> = {
    ...McCommand.flags,
    version: flags.string({char: 'v', required: true, options: versions, description: 'Minecraft Image Version'}),
  }

  static args: Parser.args.IArg<any>[] = [
    {name: 'name', required: true, description: 'Name of the server instance. Must be lowercase and contain only letters, numbers, underscore, and hypens.'},
  ]

  async run() {
    const {args} = this.parse(MakeServerCommand)

    const version: string = this.flags.version
    let name: string = args.name

    const questions: inquirer.QuestionCollection<any>[] = []
    if (!name) {
      const reply = await inquirer.prompt({
        name: 'name',
        message: 'Server name without spaces',
      })
      name = reply.name
    }

    if (name.match(/[^a-z0-9\-_]/)) {
      this.error(
        `Invalid server name: '${name}'
        The name must be lowercase and contain only letters, numbers, underscore, and hypens.
      `.trimIndent())
    }

    // if (!versions.includes(version)) {
    //   const reply = await inquirer.prompt({
    //     name: 'version',
    //     message: 'select a version',
    //     type: 'list',
    //     choices: versions.map(v => ({name: v})),
    //   })
    //   version = reply.version
    // }

    if (!versions.includes(version)) {
      this.error(`Invalid version selected: ${version}`)
    }

    await this.createServer(name, version)
  }

  // eslint-disable-next-line require-await
  async createServer(name: string, version: string) {
    const instancePath = Path.join(config.directories.instances, name)
    const imagePath = Path.join(config.directories.images, version)
    const commonPath = Path.join(config.directories.images, 'common')
    // ensure server doesn't already exist
    if (fs.existsSync(instancePath)) {
      this.error(`server ${name} already exists.`)
    }

    this.console('copying server files...')
    shell.cp('-r', imagePath, instancePath)
    shell.cp('-r', Path.join(commonPath, '/*'), instancePath)
    this.info(`Server:${name} created using the ${version} image.`)
  }
}
