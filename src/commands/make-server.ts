
import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import fs from 'fs'
import Path from 'path'
import * as inquirer from 'inquirer'
import {McCommand} from '../command-base'
import {makeWorld, MakeWorldCommand} from './make-world'
import {InstanceInfo} from '../instance-info'
import store from '../store'

export class MakeServerCommand extends McCommand {
  static description = 'Create a new Minecraft server instance.'
  static aliases = ['mkserver']
  static examples = [
    '$ mc make-server',
    '$ mc make-server uhc',
    '$ mc mkserver uhc --image=1.16.2',
  ]

  static flags: flags.Input<any> = {
    ...McCommand.flags,
    image: flags.string({char: 'i', required: true, description: 'Minecraft Image Name (1.16.1, paper_1.16.3, ...)'}),
  }

  static args: Parser.args.IArg<any>[] = [
    {name: 'name', required: true, description: 'Name of the server instance. Must be lowercase and contain only letters, numbers, underscore, and hypens.'},
  ]

  // eslint-disable-next-line require-await
  async run() {
    const {args} = this.parse(MakeServerCommand)

    const image: string = this.flags.image
    const name: string = args.name

    const images = fs.readdirSync(store.config.directories.images).filter(x => x !== 'common')
    // const questions: inquirer.QuestionCollection<any>[] = []
    // if (!name) {
    //   const reply = await inquirer.prompt({
    //     name: 'name',
    //     message: 'Server name without spaces',
    //   })
    //   name = reply.name
    // }

    if (name.match(/[^a-z0-9\-_]/)) {
      this.error(
        `Invalid server name: '${name}'
        The name must be lowercase and contain only letters, numbers, underscore, and hypens.
      `.trimIndent())
    }

    // if (!images.includes(image)) {
    //   const reply = await inquirer.prompt({
    //     name: 'image',
    //     message: 'select an image',
    //     type: 'list',
    //     choices: images.map(v => ({name: v})),
    //   })
    //   image = reply.image
    // }

    if (!images.includes(image)) {
      this.error(`Invalid image selected: ${image}`)
    }

    createServer(name, image, this)
    makeWorld(name, {worldName: 'world'}, this)
  }
}

function createServer(name: string, image: string, cmd: McCommand) {
  const instancePath = Path.join(store.config.directories.instances, name)
  const imagePath = Path.join(store.config.directories.images, image)
  const commonPath = Path.join(store.config.directories.images, 'common')
  // ensure server doesn't already exist
  if (fs.existsSync(instancePath)) {
    cmd.error(`server ${name} already exists.`)
  }

  cmd.console('copying server files...')
  shell.cp('-r', imagePath, instancePath)
  shell.cp('-r', Path.join(commonPath, '/*'), instancePath)
  cmd.info(`Server:${name} created using the ${image} image.`)
}
