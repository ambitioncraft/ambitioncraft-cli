import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell, {cat} from 'shelljs'
import Path from 'path'
import {InstanceCommandBase} from '../core/command-base'
import Discord, {Message} from 'discord.js'
import fs from 'fs'
import AdmZip from 'adm-zip'
import {PterodactylServer} from '../mc-server/pterodactyl-instance'
import getFileContents from '../panel/user-client/server/files/getFileContents'
import {getRegionPath} from '../utils/minecraft'
export default class DownloadCommand extends InstanceCommandBase {
  static aliases = ['dl']
  static description = 'Download individual regions'
  static examples = [
    'download -o=1.1 -o=1.2',
    'dl -n=0.1',
    'dl -e 0.0',
  ]

  static strict = false
  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {...InstanceCommandBase.flags,
    overworld: flags.string({char: 'o', description: 'overworld region', multiple: true, exclusive: ['end', 'nether']}),
    nether: flags.string({char: 'n', description: 'nether region', multiple: true, exclusive: ['overworld', 'end']}),
    end: flags.string({char: 'e', description: 'end region', multiple: true, exclusive: ['overworld', 'nether']}),
  }

  async run() {
    const {overworld, nether, end} =  this.flags
    const regions: string[] = []

    overworld?.forEach((region: string) => {
      regions.push(getRegionPath('overworld', region))
    })
    nether?.forEach((region: string) => {
      regions.push(getRegionPath('nether', region))
    })
    end?.forEach((region: string) => {
      regions.push(getRegionPath('end', region))
    })

    if (regions.length === 0) {
      this.error('Please specify region')
    }

    const attachments: Discord.MessageAttachment[] = []

    const promises = regions.map(async path => {
      let file = await this.instance.downloadFile(path.replace(/\\/ig, '/'))
      let filename = Path.basename(path)
      if (file.byteLength >= 8000000) {
        const zip = new AdmZip()
        zip.addFile(filename, file)
        file = zip.toBuffer()
        filename += '.zip'
      }
      attachments.push(new Discord.MessageAttachment(file, filename))
    })

    try {
      await Promise.all(promises)
    } catch (error) {
      this.error('Error downloading region')
    }

    if (this.context.source instanceof Discord.Message) {
      attachments.forEach(a => this.context.source.reply(a))
    }
  }

  // // eslint-disable-next-line require-await
  // async runLocal() {
  //   if (!this.instance.worldDir) {
  //     this.error('Download not supported for this server.')
  //   }

  //   const worldSource = this.instance.worldDir
  //   const validation = /^-?[\d]+\.-?[\d]+$/

  //   const {overworld, nether, end} =  this.flags
  //   const regions: string[] = []

  //   parseRegion(overworld, Path.join(worldSource, 'region'))
  //   parseRegion(nether, Path.join(worldSource, 'DIM-1', 'region'))
  //   parseRegion(end, Path.join(worldSource, 'DIM1', 'region'))

  //   if (regions.length === 0) {
  //     this.error('Please specify region')
  //   }

  //   const attachments: Discord.MessageAttachment[] = []
  //   regions.forEach((source: string) => {
  //     let file = fs.readFileSync(source)

  //     let filename = Path.basename(source)
  //     if (file.byteLength >= 8000000) {
  //       const zip = new AdmZip()
  //       zip.addFile(filename, file)
  //       file = zip.toBuffer()
  //       filename += '.zip'
  //     }

  //     const attachment = new Discord.MessageAttachment(file, filename)
  //     attachments.push(attachment)
  //   })

  //   if (this.context.source instanceof Discord.Message) {
  //     attachments.forEach(a => this.context.source.reply(a))
  //   }

  //   function parseRegion(values: string[] | undefined, regionDir: string) {
  //     values = values || []
  //     values.filter((x: any) => x).forEach((v: string) => {
  //       v = v.trim()
  //       if (!v.match(validation)) {
  //         throw new Error('invalid region')
  //       }
  //       const file = `r.${v}.mca`
  //       const regionUri = Path.join(regionDir, file)
  //       if (!regions.includes(regionUri)) {
  //         regions.push(regionUri)
  //       }
  //     })
  //   }
  // }
}
