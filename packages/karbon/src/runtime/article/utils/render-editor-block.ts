import { CUSTOM_FIELD_STORAGE_KEY, wrapFieldAsStorage } from '@storipress/custom-field'
import { createApp, createSSRApp, warn } from 'vue'
import type { Component } from 'vue'

const IS_RENDERED = Symbol('is-rendered')

export function useRenderEditorBlock(blocks: Record<string, Component>) {
  return {
    async render(fields: Record<string, unknown[]>, { uuid, name }: { uuid: string; name: string }) {
      const element = document.querySelector(`div[data-uuid="${uuid}"]`)
      if (element && !Reflect.get(element, IS_RENDERED)) {
        element.querySelector('pre')?.remove()
        const block = blocks[name]

        if (!block) {
          if (process.dev) {
            warn(
              `Unknown block \`${name}\`, please ensure there has \`${name}.vue\` under \`editor-blocks/\` directory`
            )
          }
          return
        }

        let root = element.querySelector('[data-editor-block-root]')
        const app = root ? createSSRApp(block) : createApp(block)
        if (!root) {
          // usually this should not happen
          root = document.createElement('div')
          root.setAttribute('data-editor-block-root', 'true')
          element.append(root)
        }
        app.provide(CUSTOM_FIELD_STORAGE_KEY, wrapFieldAsStorage(fields)).mount(root)
        Reflect.set(element, IS_RENDERED, true)
      }
    },
  }
}
