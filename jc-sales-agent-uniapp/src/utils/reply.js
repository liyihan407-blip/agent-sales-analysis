// Extract a balanced JSON object, allowing code fences and text after CHART_JSON.
export function parseReply(reply) {
  const raw = String(reply || '')
  const marker = raw.indexOf('CHART_JSON:')
  if (marker < 0) return { content: raw, chartOption: null, chartError: false }
  const content = raw.slice(0, marker).trim()
  const remaining = raw.slice(marker + 11)
  const start = remaining.indexOf('{')
  let depth = 0, quoted = false, escaped = false
  for (let i = start; start >= 0 && i < remaining.length; i++) {
    const char = remaining[i]
    if (quoted) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') quoted = false
    } else if (char === '"') quoted = true
    else if (char === '{') depth++
    else if (char === '}' && --depth === 0) {
      try {
        const chartOption = JSON.parse(remaining.slice(start, i + 1))
        if (!Array.isArray(chartOption.series) || !chartOption.series.length) break
        const tail = remaining.slice(i + 1).replace(/^\s*```/, '').trim()
        return { content: [content, tail].filter(Boolean).join('\n\n'), chartOption, chartError: false }
      } catch { break }
    }
  }
  return { content: content || '已收到分析结果。', chartOption: null, chartError: true }
}

export function chartData(option) {
  const series = Array.isArray(option?.series) ? option.series : []
  const axis = Array.isArray(option?.xAxis) ? option.xAxis[0] : option?.xAxis
  return series.map((s, index) => ({
    name: s.name || `数据 ${index + 1}`,
    type: s.type,
    rows: (s.data || []).map((item, i) => ({
      name: String(item?.name ?? axis?.data?.[i] ?? i + 1),
      value: Number(typeof item === 'object' && item !== null ? item.value : item),
    })).filter(row => Number.isFinite(row.value)),
  }))
}
