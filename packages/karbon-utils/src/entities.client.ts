export function decode(html: string) {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = html
  return textarea.value
}
