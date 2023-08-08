import fs from 'fs-extra'
import yaml from 'js-yaml'
import invariant from 'tiny-invariant'

export async function configYarn(yarnConfigPath: string) {
  const config = await loadYarnConfig(yarnConfigPath)

  // use node-modules for compatible
  config.nodeLinker = 'node-modules'

  // make yarn only touch files under /tmp
  config.enableGlobalCache = false
  config.cacheFolder = '/tmp/home/.yarn-cache'

  // remove custom yarn and plugins
  Reflect.deleteProperty(config, 'yarnPath')
  Reflect.deleteProperty(config, 'plugins')

  await fs.writeFile(yarnConfigPath, yaml.dump(config))
}

async function loadYarnConfig(yarnConfigPath: string): Promise<Record<string, unknown>> {
  try {
    const content = await fs.readFile(yarnConfigPath, 'utf-8')
    const config = yaml.load(content) || ({} as Record<string, unknown>)
    invariant(config !== null && typeof config === 'object', 'YAML config invalid')
    return config as unknown as Record<string, unknown>
  } catch {
    return {}
  }
}
