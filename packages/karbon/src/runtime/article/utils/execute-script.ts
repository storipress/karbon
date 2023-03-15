export function executeScriptElements(containerElement: Element) {
  const scriptElements = containerElement.querySelectorAll('script')

  Array.from(scriptElements).forEach((scriptElement) => {
    const clonedElement = document.createElement('script')

    Array.from(scriptElement.attributes).forEach((attribute) => {
      clonedElement.setAttribute(attribute.name, attribute.value)
    })

    clonedElement.text = scriptElement.text

    scriptElement.parentNode?.replaceChild(clonedElement, scriptElement)
  })
}
