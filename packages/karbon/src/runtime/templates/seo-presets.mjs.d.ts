export interface PresetConfig {
  preset?: string
  presetFactory?: () => any
  options?: Record<string, any>
}

const configs: PresetConfig[]

export default configs
