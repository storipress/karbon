import { globby } from 'globby'
import { kebabCase, snakeCase } from 'scule'
import { basename } from 'pathe'
import type { Tlayout } from './types'
import { bundle } from './index'

export async function bundleLayouts() {
  const files = await globby(['templates/article-layouts/*.vue'])
  const jsonVariable = {
    layouts: [] as Tlayout[],
  }

  await Promise.all(
    files.map(async (filePath) => {
      const vuefileName = basename(filePath, '.vue')
      const layoutId = snakeCase(vuefileName)
      const layoutName = kebabCase(vuefileName)
      jsonVariable.layouts.push({
        id: layoutId,
        name: layoutId,
        file: `./layouts/${layoutName}.js`,
        path: filePath,
      })
      await bundle(filePath, vuefileName, layoutName, 'layouts')
    })
  )

  return jsonVariable
}
