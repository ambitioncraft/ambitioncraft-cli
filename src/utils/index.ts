/* eslint-disable no-extend-native */
export * as minecraft from './minecraft'
export {throttle, CanceledError} from './throttle'

String.prototype.trimLines = function () {
  return this.replace(/\s+(\r\n|\r|\n)\s+/gm, '\r\n').trim()
}

String.prototype.trimIndent = function () {
  return this.replace(/^\s+/gm, '').trim()
}

String.prototype.trimMargin = function () {
  return this.replace(/^\s+\|/gm, '').trim()
}
