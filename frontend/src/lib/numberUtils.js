export function normalizeNumberInputValue(value) {
  if (value === null || value === undefined) return ''

  const raw = String(value).trim()
  if (!raw) return ''

  // Backend often returns decimal strings like "3500000,00".
  const normalized = raw.replace(/\s+/g, '').replace(',', '.')
  const num = Number(normalized)

  if (!Number.isFinite(num)) {
    return raw.replace(/([,.]00)+$/, '')
  }

  if (Number.isInteger(num)) {
    return String(num)
  }

  return String(num)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1')
}
