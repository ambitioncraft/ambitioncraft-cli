import {flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import shell from 'shelljs'
import Path from 'path'
import {InstanceCommandBase} from '../core/command-base'
import {exception} from 'console'

export default class BackupCommand extends InstanceCommandBase {
  static aliases = []
  static description = 'Backup individual regions'
  static examples = [
    '!backup -o=1.1',
    '!backup -o=0.1 -o=-1.1',
    '!backup -o=0.1 -n=0.0',
  ]

  static strict = false
  static args: Parser.args.IArg<any>[] = [
    ...InstanceCommandBase.args,
  ]

  static flags: flags.Input<any> = {...InstanceCommandBase.flags,
    overworld: flags.string({char: 'o', description: 'overworld region', multiple: true}),
    nether: flags.string({char: 'n', description: 'nether region', multiple: true}),
    end: flags.string({char: 'e', description: 'end region', multiple: true}),
  }

  // eslint-disable-next-line require-await
  async run() {
    if (!this.instance.worldDir || !this.instance.backupDir) {
      this.error('Backup not supported for this server.')
    }
    const worldSource = this.instance.worldDir
    const backupDest = this.instance.backupDir
    const validation = /^-?[\d]+\.-?[\d]+$/

    const {overworld, nether, end} =  this.flags
    const regions: string[] = []

    parseRegion(overworld, Path.join(worldSource, 'region'))
    parseRegion(nether, Path.join(worldSource, 'DIM-1', 'region'))
    parseRegion(end, Path.join(worldSource, 'DIM1', 'region'))

    regions.forEach((source: string) => {
      const dest = source.replace(worldSource, backupDest)

      const result = shell.cp('-f', source, dest)
      if (result.code !== 0) {
        this.error(result.stderr.replace(worldSource, '').replace(backupDest, ''))
      }
      this.success(`${Path.basename(source)}: saved`)
    })

    function parseRegion(values: string[] | undefined, regionDir: string) {
      values = values || []
      values.forEach((v: string) => {
        v = v.trim()
        if (!v.match(validation)) {
          throw new Error('invalid region')
        }
        const file = `r.${v}.mca`
        const regionUri = Path.join(regionDir, file)
        regions.push(regionUri)
      })
    }
  }
}
