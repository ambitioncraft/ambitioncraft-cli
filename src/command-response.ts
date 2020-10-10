import EventEmitter from 'events'
export type loglevel = 'info' | 'success' | 'warn' | 'danger' | 'error'
type log = {message: string; level: loglevel}
export default class CommandResponse extends EventEmitter  {
  title?: string
  color: Colors = Colors.DEFAULT
  customColor?: string
  description?: string
  fields: responseField[] = []
  footer?: { text: any; iconURL: string | undefined }
  logs: log[] = []
  hasWarning = false
  hasError = false
  isEmbed = true
  setTitle(title: any): CommandResponse {
    this.title = title
    return this
  }

  setColor(color: Colors): CommandResponse {
    this.color = color
    return this
  }

  setColorCustom(color: any) {
    this.customColor = color
    return this
  }

  setDescription(wrapInCodeBlock: boolean, description: any): CommandResponse {
    this.description = description
    if (wrapInCodeBlock) {
      this.description = '```\n' + this.description + '\n```'
    }
    return this
  }

  addField(name: any, value: any, inline?: boolean): CommandResponse {
    this.fields.push({name, value, inline})
    return this
  }

  setFooter(text: any, iconURL?: string): CommandResponse {
    this.footer = {text, iconURL}
    return this
  }

  private log(message: string, level: loglevel) {
    const log = {message, level}
    this.logs.push(log)
    this.emit('log', log)
  }

  info(message: string | undefined) {
    if (message === undefined) return
    this.log(message, 'info')
  }

  success(message: string) {
    this.log(message, 'success')
  }

  warn(warning: string) {
    this.hasWarning = true
    this.log(warning, 'warn')
  }

  error(error: string) {
    this.hasError = true
    this.log(error, 'error')
  }

  async flush() {
    await Promise.all(this.listeners('flush').map(a => a()))
  }

  toConsoleFormat(): string {
    const lines = [
      this.title || '',
      this.description || '',
      this.fields.map(x => x.name + ' ' + x.value).join('\n') || '',
      this.footer || '',
    ]
    return lines.filter(x => x !== '').join('\n')
  }
}

function strEnum<T extends string>(o: Array<T>): { [K in T]: K } {
  return o.reduce((res, key) => {
    res[key] = key
    return res
  }, Object.create(null))
}

export const Colors = strEnum([
  'DEFAULT',
  'WHITE',
  'AQUA',
  'GREEN',
  'BLUE',
  'YELLOW',
  'PURPLE',
  'LUMINOUS_VIVID_PINK',
  'GOLD',
  'ORANGE',
  'RED',
  'GREY',
  'DARKER_GREY',
  'NAVY',
  'DARK_AQUA',
  'DARK_GREEN',
  'DARK_BLUE',
  'DARK_PURPLE',
  'DARK_VIVID_PINK',
  'DARK_GOLD',
  'DARK_ORANGE',
  'DARK_RED',
  'DARK_GREY',
  'LIGHT_GREY',
  'DARK_NAVY',
  'BLURPLE',
  'GREYPLE',
  'DARK_BUT_NOT_BLACK',
  'NOT_QUITE_BLACK',
  'RANDOM',
])
export type Colors = keyof typeof Colors

type responseField = { name: any; value: any; inline?: boolean }
