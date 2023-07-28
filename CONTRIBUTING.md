# Contributing to Karbon

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

**Working on your first Pull Request?** You can learn how from this _free_ series
[How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

Please join our Slack channel if you have any questions or just want to say hi.

## Project setup

### Prerequisites

For hacking on Karbon you'll need to have [Node.js and npm](https://docs.npmjs.com/getting-started/installing-node) and [Github CLI](https://cli.github.com) installed.

### Quick and dirty setup

`gh clone storipress/karbon`

This will clone the `karbon` repository to your current working directory.

### I already cloned it!

If you cloned it somewhere else, you'll want to use `yarn install` within the package directory to get dependencies.

### Workflow

To start hacking:

1. enter `packages/playground` directory
2. copy `.env.example` to `.env`
3. run `yarn postinstall` to prepare dev environment
4. setup `.env` under the `packages/playground` with your [Storipress](https://storipress.com) credentials
5. run `yarn dev` from the package directory to start the playground

Cut a branch while you're working then either submit a Pull Request when done or when you want some feedback!

### Running specs

To run tests on the command line use `yarn test` within the package directory.

We use Vitest for writing specs.

### Typescript

We use Tyepscript for type checking. Before you make a pull request, you should solve any type errors. If you have an error you can't fix after taking a crack at it, feel free to open your PR anyway and ask for help there.
