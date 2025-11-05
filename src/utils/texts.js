export function toSnakeCase(str, defaultValue = "default") {
  if (!str) {
    return defaultValue
  }
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
}

export function cleanKudos(str, defaultValue = "default") {
  if (!str) {
    return defaultValue
  }
  return str
    .replace(/<!(\w+)(?:\|[^>]+)?>/g, '')
    .replace(/<@[\w]+?\|([^>]+)>/g, '$1')
    .replace(/<@[\w]+>/g, '')
    .replace(/:[^:\s]+:/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}