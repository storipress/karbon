import prettyBytes from 'pretty-bytes'

export enum karbonMsg {
  jsonPosition = '.storipress/storipress.json',
  blocksPosError = 'Cannot find Bundled blocks files.',
  layoutsPosError = 'Cannot find Bundled layouts files.',
  uploadError = 'upload failed',
  compressingError = 'compressing failed',
  versionWarning = 'Your node version is too low, please upgrade to v16.17.0 or higher.',
}
export const safeExt = 'zip'
export const extErrorMsg = `File extension is not ${safeExt}`
export const sizeErrorMsg = (fileSize: number, maxSize: number) => {
  return `File size ${prettyBytes(fileSize)} bigger than maximium size ${prettyBytes(maxSize)}`
}
