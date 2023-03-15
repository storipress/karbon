import prettyBytes from 'pretty-bytes'

export enum karbonMsg {
  jsonPosition = '.storipress/storipress.json',
  blocksPosError = 'Cannot find Bundled blocks files.',
  layoutsPosError = 'Cannot find Bundled layouts files.',
  uploadError = 'upload failed',
  compressingError = 'compressing failed',
}
export const safeExt = 'zip'
export const extErrorMsg = `File extension is not ${safeExt}`
export const sizeErrorMsg = (fileSize: number, maxSize: number) => {
  return `File size ${prettyBytes(fileSize)} bigger than maximium size ${prettyBytes(maxSize)}`
}
