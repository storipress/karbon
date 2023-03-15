export function paramNameToParamKey(paramName: string) {
  let res = paramName
  if (res.startsWith(':')) {
    res = res.slice(1)
  }
  if (res.endsWith('?')) {
    res = res.slice(0, -1)
  }
  return res
}
