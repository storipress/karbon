import consola from 'consola'
import type { Plugin } from 'vite'

export default function importerChecker(): Plugin {
  const virtualModuleId = '#imports'
  const CHECK_IMPORTER_DIR = ['article-layout', 'editor-blocks']

  return {
    name: 'importer-checker',
    resolveId(id, importer) {
      if (!importer) {
        return
      }

      const findImporter = CHECK_IMPORTER_DIR.find((dir) => importer.includes(dir))

      if (importer && findImporter) {
        if (id === virtualModuleId) {
          consola.warn(
            `Currently we don't support to import from "#imports", please don't use under the directory of "${findImporter}"`,
          )
        }
      }
    },
  }
}
