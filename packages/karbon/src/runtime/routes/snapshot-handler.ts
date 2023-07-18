import devalue from '@nuxt/devalue'
import { basename, extname } from 'pathe'
import { setHeader } from 'h3'
import { parsePath } from 'ufo'

export const NOT_FOUND = Symbol('not found')

interface Handler {
  (name: string, event: any): Promise<unknown>
}

interface DefineSnapshotHandlerInput {
  fixedName?: string
  handler: Handler
}

export function defineSnapshotHandler(input: DefineSnapshotHandlerInput | Handler): any {
  const { handler, fixedName } = normalizeDefineSnapshotHandlerInput(input)
  return async (event: any) => {
    const _name = fixedName ? extractName(event.path) : event.context.params.name
    const parsedName = parseName(_name)
    if (!parsedName) {
      setHeader(event, 'Content-Type', 'text/html')
      return '<h1>Bad request</h1>'
    }

    const { name, type } = parsedName

    if (fixedName && fixedName !== name) {
      setHeader(event, 'Content-Type', 'text/html')
      return '<h1>Not Found for such name</h1>'
    }

    const result = await handler(name, event)
    if (result === NOT_FOUND) {
      setHeader(event, 'Content-Type', 'text/html')
      return '<h1>Not Found</h1>'
    }

    if (type === 'json') {
      setHeader(event, 'Content-Type', 'application/json')
      return result
    } else if (type === 'js') {
      setHeader(event, 'Content-Type', 'application/javascript')
      return renderAsJavascript(result)
    }
  }
}

export function parseName(name: string) {
  const ext = extname(name)
  if (!ext) {
    return
  }

  const prefix = basename(name, ext)
  if (ext === '.js') {
    return { type: 'js', name: prefix }
  }

  if (ext === '.json') {
    return { type: 'json', name: prefix }
  }

  return null
}

function normalizeDefineSnapshotHandlerInput(input: DefineSnapshotHandlerInput | Handler): DefineSnapshotHandlerInput {
  return typeof input === 'function' ? { handler: input } : input
}

function extractName(path?: string): string {
  // Vite may append extra query at the path, we use `parsePath` to remove it
  const { pathname } = parsePath(path)
  return basename(pathname)
}

export function renderAsJavascript(data: unknown): string {
  return `export default ${devalue(data)}`
}
