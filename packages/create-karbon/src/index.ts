#!/usr/bin/env node
import process from 'node:process'
import { downloadTemplate } from 'giget'
import consola from 'consola'
import parse from 'minimist'

const argv = parse(process.argv.slice(2))

let [template, target] = argv._

if (!target) {
  target = template
  template = 'default'
}

async function main() {
  try {
    const { dir } = await downloadTemplate(`gh:storipress/karbon-starter#${template}`, {
      dir: target || 'karbon-app',
    })
    consola.info(`Init Karbon project with \`${template}\` template at \`${dir}\` successfully!`)
  } catch (err) {
    consola.error('Init Karbon project failed!')
    consola.error(err)
  }
}

main().catch((err) => consola.error(err))
