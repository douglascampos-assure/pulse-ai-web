export function toSnakeCase(str, defaultValue = "default") {
  if (!str) {
    return defaultValue
  }
  return str
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_');
}