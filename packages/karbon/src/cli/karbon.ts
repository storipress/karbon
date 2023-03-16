import { pipeline } from 'node:stream/promises'
import process from 'node:process'
import fs from 'fs-extra'
import path from 'pathe'
import JSZip from 'jszip'
import { globby } from 'globby'
import { oraPromise } from 'ora'
import parseArgv from 'minimist'
import chalk from 'chalk'
import * as Sentry from '@sentry/node'
import consola from 'consola'
import { requestPresignedUploadURL, uploadSiteTemplate } from '../runtime/api/siteTemplate'
import { EventName, initTrack, track } from '../track'
import type { Tblock, Tlayout } from './bundle/types'
import { SummaryType } from './bundle/types'
import { bundleEditorBlocks, bundleLayouts } from './bundle'
import { checkFile } from './checkFile'
import { karbonMsg, sizeErrorMsg } from './checkFile/setting'

/* eslint-disable no-console */
const log = console.log
const group = console.group
const groupEnd = console.groupEnd
const { deployStart, deploySuccess, deployFail } = EventName
const siteTemplateName = 'siteTemplate.zip'

async function runBundle() {
  const argv = parseArgv(process.argv.slice(2), {
    alias: {
      packOnly: 'pack-only',
    },
  })
  await initTrack('cli')
  await track(deployStart)

  const { layouts, blocks } = await oraPromise(bundle, { text: 'bundling', successText: 'bundled' })
  try {
    await oraPromise(compress, { text: 'compressing', successText: 'compressed' })
    await checkFile(siteTemplateName)
    if (!argv.packOnly) {
      await oraPromise(upload, { text: 'uploading', successText: 'uploaded' })
    }
    await track(deploySuccess, { articleLayout: layouts.length, editorBlock: blocks.length })
    log(`${chalk.greenBright('❤️ Karbon app successfully deployed to Storipress ❤️!')} \n`)
    log(`${chalk.whiteBright.bold('Summary deploy fields')}`)
    logSummary(layouts, 'template')
    logSummary(blocks, 'block')
  } catch (error) {
    Sentry.captureException(error)
    await track(deployFail, { articleLayout: layouts.length, editorBlock: blocks.length })
    consola.error(
      'Karbon app fail to deploy! Please open an issue on https://github.com/storipress/karbon/issues with the following log'
    )
    consola.error(error)
  }
}

runBundle()

async function bundle() {
  await fs.remove('.storipress')
  await fs.mkdirs('.storipress/editor-blocks-ssr')
  await fs.mkdirs('.storipress/editor-blocks')
  const layouts = await bundleLayouts()
  const blocks = await bundleEditorBlocks()

  fs.writeFileSync('.storipress/storipress.json', JSON.stringify({ ...layouts, ...blocks }))

  return { ...layouts, ...blocks }
}

async function compress() {
  await fs.remove(siteTemplateName)

  const files = await globby(
    [
      '**/*',
      '.env',
      '.yarnrc.yml',
      '.npmrc',
      '.storipress',
      '!node_modules',
      '!dist',
      '!.output',
      '!.vscode',
      '!.git',
      '!.nuxt',
      '!docs',
      '!**/*.tgz',
    ],
    {
      ignoreFiles: [path.join(process.cwd(), '.karbonignore')],
    }
  )

  const zip = new JSZip()

  for (const file of files) {
    const data = fs.readFileSync(file)
    zip.file(file, data)
  }

  let fileSize = 0
  const maximumSize = 1024 * 1024 * 2

  await pipeline(
    zip
      .generateNodeStream({
        type: 'nodebuffer',
        streamFiles: true,
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      })
      .on('data', (chunk) => {
        fileSize += chunk.length
      })
      .once('end', () => {
        if (fileSize > maximumSize) {
          consola.error(sizeErrorMsg(fileSize, maximumSize))
          throw new Error(karbonMsg.compressingError)
        }
      }),
    fs.createWriteStream(siteTemplateName)
  )
}

async function upload() {
  const buffer = await fs.readFile(siteTemplateName)
  const key = await requestPresignedUploadURL(buffer)
  const result = await uploadSiteTemplate(key)
  if (result) {
    await fs.remove(siteTemplateName)
  }
}

function logSummary(resources: (Tlayout | Tblock)[], type: keyof typeof SummaryType) {
  // Remove duplicate display. Editor block will have two versions, the log only needs to be displayed once
  if (type === 'block') {
    const set = new Set()
    resources = resources.filter((resource) => (!set.has(resource.id) ? set.add(resource.id) : false))
  }

  const LABEL = {
    template: 'Article Templates',
    block: 'Editor Blocks',
  }
  const summary = resources.map(
    (resource) => `- ${SummaryType[type]} \`${chalk.whiteBright.bold(resource.id)}\` (path: ${resource.path})`
  )

  group(LABEL[type])
  log(summary.join('\n'))
  groupEnd()
}
