import { basename } from 'pathe'
import { hash } from 'ohash'
import { resolvePath } from '@nuxt/kit'
import { genSafeVariableName } from 'knitwork'
import type { ResolvedSEOConfig, SEOConfig } from './runtime/types'
import { logger } from './logger'

const builtinPresets = new Set(['basic', '__empty'])

export async function resolveSEOProviders(configs: SEOConfig[]): Promise<ResolvedSEOConfig[]> {
  const providers: ResolvedSEOConfig[] = []
  for (const config of configs) {
    if (!config.preset && !config.provider) {
      logger.warn('SEO config must have either `preset` or `provider`', config)
      continue
    }

    if (config.preset) {
      if (!builtinPresets.has(config.preset)) {
        logger.warn(`Unknown SEO preset '${config.preset}'`)
        continue
      }

      providers.push({
        preset: config.preset,
        options: config.options || {},
      })
    }

    if (config.provider) {
      const importPath = await resolvePath(config.provider)
      const importName = genSafeVariableName(`${basename(config.provider)}$SEO_${hash(config)})}`)
      providers.push({
        importName,
        importPath,
        options: config.options || {},
      })
    }
  }

  return providers
}
