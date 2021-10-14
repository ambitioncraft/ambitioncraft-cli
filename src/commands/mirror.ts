import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import Path from 'path'
import {InstanceCommandBase} from '../core/command-base'
import fs from 'fs'
import {getOnlinePlayers} from './list'

import {McServer, stopInstance, startInstance} from '../mc-server/mc-server'
import {getRegionPath} from '../utils/minecraft'

export default class MirrorCommand extends InstanceCommandBase {
  static description = 'Mirror Regions To Copy'
  static examples = [
    'mirror smp -o=1.1 -o=1.2',
  ]

  static strict = false
  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {
    ...InstanceCommandBase.flags,
    overworld: flags.string({char: 'o', description: 'overworld region', multiple: true}),
    nether: flags.string({char: 'n', description: 'nether region', multiple: true}),
    end: flags.string({char: 'e', description: 'end region', multiple: true}),
  }

  async run() {
    const mirrorInstance = await this.instance.getMirrorInstance()
    if (!mirrorInstance) {
      this.error('A mirror instance has not been configured for this server.')
    }

    const {overworld, nether, end} = this.flags
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
      this.error('Please specify region(s) to mirror. See --help for more info')
    }

    this.info(`Checking ${mirrorInstance.name} status`)
    if (await mirrorInstance.isRunning()) {
      const list = await getOnlinePlayers(mirrorInstance)
      // eslint-disable-next-line eqeqeq
      if (list.onlineCount != '0') {
        this.error(`Cannot mirror while players are on ${mirrorInstance.name}.\r\n Players: ${list.players.splice(2)}`)
      }

      this.info(`Waiting for ${mirrorInstance.name} to shutdown, please wait...`)
      try {
        await stopInstance(mirrorInstance, true)
      } catch {
        this.error('Unable to determine mirror server status')
      }
    }
    this.info(`Server: ${mirrorInstance.name} is offline, preparing transfer`)

    const promises = regions.map(async sourcePath => {
      const fileName = Path.basename(sourcePath)
      const remotePath = sourcePath.replace(/\\/ig, '/') // might need to change if instance path is setup differently
      const contents = await this.instance.downloadFile(sourcePath.replace(/\\/ig, '/'))
      const destBackupName = `${fileName}.${Date.now().toString()}`
      const baseName = Path.dirname(remotePath)
      this.info(`Mirroring Region: ${remotePath}`)
      await mirrorInstance.renameFiles(baseName, fileName, destBackupName)
      this.success(`Renamed: ${fileName} to ${destBackupName}`)
      await mirrorInstance.uploadFile(remotePath, contents)
      this.success(`Uploaded: ${remotePath}`)
    })

    try {
      await Promise.all(promises)
    } catch {
      this.error('Error mirroring regions')
    }

    this.info(`Restarting ${mirrorInstance.name}, please wait...`)
    await startInstance(mirrorInstance)
    this.info(`Server: ${mirrorInstance.name} started`)
    this.success('All done :)')
  }

  // async runLocal() {
  //   const mirrorInstance = await this.instance.getMirrorInstance()
  //   if (!mirrorInstance || !this.instance.worldDir) {
  //     this.error('Mirror not supported for this server.')
  //   }

  //   const worldSource = this.instance.worldDir
  //   const validation = /^-?[\d]+\.-?[\d]+$/

  //   const {overworld, nether, end} = this.flags
  //   const regions: string[] = []

  //   parseRegion(overworld, Path.join(worldSource, 'region'))
  //   parseRegion(nether, Path.join(worldSource, 'DIM-1', 'region'))
  //   parseRegion(end, Path.join(worldSource, 'DIM1', 'region'))

  //   if (regions.length === 0) {
  //     this.error('Please specify region(s) to mirror. See --help for more info')
  //   }

  //   this.info(`Checking ${mirrorInstance.name} status`)
  //   if (await mirrorInstance.isRunning()) {
  //     const list = await getOnlinePlayers(mirrorInstance)
  //     // eslint-disable-next-line eqeqeq
  //     if (list.onlineCount != '0') {
  //       this.error(`Cannot mirror while players are on ${mirrorInstance.name}. Players: ${list.players.splice(2)}`)
  //     }

  //     this.info(`Waiting for ${mirrorInstance.name} to shutdown, please wait...`)
  //     try {
  //       await stopServer(mirrorInstance)
  //     } catch {
  //       this.error('Unable to determine mirror server status')
  //     }
  //   }
  //   this.info(`Server: ${mirrorInstance.name} is offline, preparing transfer`)

  //   for (const source of regions) {
  //     const contents = fs.readFileSync(source)
  //     const path = source.replace(worldSource, '')

  //     const remotePath = Path.join('/world', path)
  //     const baseName = Path.dirname(remotePath)
  //     const fileName = Path.basename(path)
  //     const destFileName = `${fileName}.${Date.now().toString()}`
  //     this.info(`Mirroring Region: ${remotePath}`)
  //     // eslint-disable-next-line no-await-in-loop
  //     await mirrorInstance.renameFiles(baseName, fileName, destFileName)
  //     this.success(`Renamed: ${fileName} to ${destFileName}`)
  //     // eslint-disable-next-line no-await-in-loop
  //     await mirrorInstance.uploadFile(remotePath, contents)
  //     this.success(`Uploaded: ${remotePath}`)
  //   }

  //   this.info(`Restarting ${mirrorInstance.name}, please wait...`)
  //   await mirrorInstance.start()
  //   this.info(`Server: ${mirrorInstance.name} started`)
  //   this.success('All done :)')
  //   function parseRegion(values: string[] | undefined, regionDir: string) {
  //     values = values || []
  //     values.forEach((v: string) => {
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
