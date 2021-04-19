import { flags } from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import Path from 'path'
import { InstanceCommandBase } from '../core/command-base'
import Discord, { Message } from 'discord.js'
import fs from 'fs'
import AdmZip from 'adm-zip'
import { PterodactylServer } from '../mc-server/pterodactyl-instance'
import getFileContents from '../panel/user-client/server/files/getFileContents'
import { getOnlinePlayers } from './list'
import retry from 'async-retry'
import { McServer } from '../mc-server/mc-server'
import { time } from 'console'

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
    overworld: flags.string({ char: 'o', description: 'overworld region', multiple: true, exclusive: ['end', 'nether'] }),
    nether: flags.string({ char: 'n', description: 'nether region', multiple: true, exclusive: ['overworld', 'end'] }),
    end: flags.string({ char: 'e', description: 'end region', multiple: true, exclusive: ['overworld', 'nether'] }),
  }

  // eslint-disable-next-line require-await
  async run() {
    const mirrorInstance = await this.instance.getMirrorInstance();
    if (!mirrorInstance || !this.instance.worldDir) {
      this.error('Mirror not supported for this server.')
    }

    const worldSource = this.instance.worldDir
    const validation = /^-?[\d]+\.-?[\d]+$/

    const { overworld, nether, end } = this.flags
    const regions: string[] = []

    parseRegion(overworld, Path.join(worldSource, 'region'))
    parseRegion(nether, Path.join(worldSource, 'DIM-1', 'region'))
    parseRegion(end, Path.join(worldSource, 'DIM1', 'region'))

    if (regions.length == 0) {
      this.error('Please specify region(s) to mirror. See --help for more info')
    }

    this.info(`Checking ${mirrorInstance.name} status`)
    if (await mirrorInstance.isRunning()) {
      const list = await getOnlinePlayers(mirrorInstance)
      if (list.onlineCount != '0') {
        this.error(`Cannot mirror while players are on ${mirrorInstance.name}. Players: ${list.players.splice(2)}`)
      }

      this.info(`Waiting for ${mirrorInstance.name} to shutdown, please wait...`)
      try {
        await stopServer(mirrorInstance)
        
      } catch {
        this.error('Unable to determine mirror server status')
      }
    }
    this.info(`Server: ${mirrorInstance.name} is offline, preparing transfer`)
    
    for (const source of regions) {
      let contents = fs.readFileSync(source)
      let path = source.replace(worldSource, '')
      
      const remotePath = Path.join('/world', path)
      const baseName = Path.dirname(remotePath)
      const fileName = Path.basename(path)
      const destFileName = `${fileName}.${Date.now().toString()}`
      this.info(`Mirroring Region: ${remotePath}`)
      await mirrorInstance.renameFiles(baseName, fileName, destFileName)
      this.success(`Renamed: ${fileName} to ${destFileName}`)
      await mirrorInstance.uploadFile(remotePath, contents)
      this.success(`Uploaded: ${fileName}`)
    }

    this.info(`Restarting ${mirrorInstance.name}, please wait...`);
    await mirrorInstance.start();
    this.info(`Server: ${mirrorInstance.name} started`)
    this.success('All done :)')
    function parseRegion(values: string[] | undefined, regionDir: string) {
      values = values || []
      values.forEach((v: string) => {
        v = v.trim()
        if (!v.match(validation)) {
          throw new Error('invalid region')
        }
        const file = `r.${v}.mca`
        const regionUri = Path.join(regionDir, file)
        if (!regions.includes(regionUri)) {
          regions.push(regionUri)
        }
      })
    }
  }


}

export async function stopServer(instance: McServer) {
  await instance.stop()
  await retry(async abort => {
    const result = (await instance.getState()).status === 'offline'
    if (!result) throw new Error('not started yet...')
    return result
  }, {
    maxRetryTime: 60000,
    minTimeout: 2000,
    maxTimeout: 5000,
    onRetry: (e, i) => {
      console.log(`attempting to shutdown... attempt: ${i}`)
    },
  })
}

export async function startServer(instance: McServer) {
  await instance.start()

  const isReady = await retry(async abort => {
    const result = (await instance.getState()).isRconReady
    if (!result) throw new Error('not started yet...')
    return result
  }, {
    maxRetryTime: 60000,
    minTimeout: 2000,
    maxTimeout: 5000,
    onRetry: (e, i) => {
      console.log(`attempting to connect... attempt: ${i}`)
    },
  })
}