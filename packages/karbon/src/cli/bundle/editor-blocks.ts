import { globby } from 'globby'
import { kebabCase, snakeCase } from 'scule'
import { basename } from 'pathe'
import type { Tblock } from './types'
import { bundle } from './index'

export async function bundleEditorBlocks() {
  const files = await globby(['templates/editor-blocks/*.vue'])
  const jsonVariable = {
    blocks: [] as Tblock[],
  }

  await Promise.all(
    files.flatMap((filePath) => {
      const vuefileName = basename(filePath, '.vue')
      const blockId = snakeCase(vuefileName)
      const blockName = kebabCase(vuefileName)
      jsonVariable.blocks = [
        ...jsonVariable.blocks,
        {
          id: blockId,
          name: blockId,
          file: `./editor-blocks/${blockName}.js`,
          path: filePath,
          ssr: false,
        },
        {
          id: blockId,
          name: blockId,
          file: `./editor-blocks-ssr/${blockName}.js`,
          path: filePath,
          ssr: true,
        },
      ]
      return [
        bundle(filePath, vuefileName, blockName, 'editor-blocks'),
        bundle(filePath, vuefileName, blockName, 'editor-blocks-ssr', true),
      ]
    })
  )
  return jsonVariable
}
