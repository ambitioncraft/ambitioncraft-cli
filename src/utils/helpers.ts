/* eslint-disable no-extend-native */
interface String{
  trimLines(): string;
  trimIndent(): string;
  trimMargin(): string;
}

String.prototype.trimLines = function () {
  return this.replace(/\s+(\r\n|\r|\n)\s+/gm, '\r\n').trim()
}

String.prototype.trimIndent = function () {
  return this.replace(/^\s+/gm, '').trim()
}

String.prototype.trimMargin = function () {
  return this.replace(/^\s+\|/gm, '').trim()
}
