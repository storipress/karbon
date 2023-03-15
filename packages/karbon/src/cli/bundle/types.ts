export interface Tlayout {
  id: string
  name: string
  file: string
  path: string
}

export interface Tblock {
  id: string
  name: string
  file: string
  path: string
  ssr: boolean
}

export enum SummaryType {
  template = 'Template',
  block = 'Block',
}
