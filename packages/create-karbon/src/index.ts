import process from 'node:process'
import { downloadTemplate } from 'giget'
import consola from 'consola'
import parse from 'minimist'

const argv = parse(process.argv.slice(2))

let [template, target] = argv._

if (!target) {
  target = template
  template = 'scratch'
}

async function main() {
  await downloadTemplate(`gh:storipress/karbon-starter#${template}`, {
    dir: target,
  })
}

main().catch((err) => consola.error(err))
