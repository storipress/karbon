import { $ } from 'zx'

await $`git pull --rebase --autostash`

const res = await $`yarn prettier --check package.json`.nothrow()

if (res.exitCode !== 0) {
  await $`yarn prettier --write package.json`
  await $`git add package.json`
  await $`git commit -m "style: format package.json"`
}

await $`git push`

await $`yarn run lint`
await $`yarn run prepack`
await $`yarn run changelogen --release`
await $`yarn npm publish`
await $`git push --follow-tags`
