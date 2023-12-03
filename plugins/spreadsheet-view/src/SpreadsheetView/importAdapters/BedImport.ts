import { assembleLocString } from '@jbrowse/core/util'
import { parseStrand } from './util'
import LocString from './components/LocString'

const MAX_SET_SCAN = 100
const MAX_BED_COL = 6

export async function parseBedBuffer(buffer: Buffer) {
  const data = new TextDecoder('utf8', { fatal: true }).decode(buffer)
  const lines = data.split(/\n|\r\n|\r/).filter(f => !!f)
  const headerLines = []
  let i = 0
  for (
    ;
    i < lines.length &&
    (lines[i].startsWith('#') ||
      lines[i].startsWith('browser') ||
      lines[i].startsWith('track'));
    i++
  ) {
    headerLines.push(lines[i])
  }
  const header = headerLines.join('\n')
  const lastHeaderLine = headerLines.at(-1)
  let names = [] as string[]
  if (lastHeaderLine?.startsWith('#')) {
    names = lastHeaderLine
      .slice(1)
      .split('\t')
      .map(f => f.trim())
  }

  const columns = new Set([
    'refName',
    'start',
    'end',
    'mate.refName',
    'mate.start',
    'mate.end',
    'name',
    'score',
    'strand',
    'mate.strand',
    ...names.slice(9),
  ])
  const rows = []
  for (let j = 0; i < lines.length; i++, j++) {
    const line = lines[i]
    const l = line.split('\t')
    const refName = l[0]
    const start = +l[1]
    const end = +l[2]
    const name = l[3]
    const score = +l[4]
    const strand = parseStrand(l[5])

    const extra = l.slice(MAX_BED_COL)
    const rest = Object.fromEntries(
      extra.map((e, idx) => {
        const key = names[idx + MAX_BED_COL] || `extra_${idx}`

        if (j < MAX_SET_SCAN) {
          columns.add(key)
        }
        return [key, e]
      }),
    )

    rows.push({
      ...rest,
      loc: assembleLocString({
        refName,
        start,
        end,
      }),
      id: `row_${i}`,
      start,
      end,
      refName,
      strand,
      name,
      score,
    })
  }

  return {
    header,
    rows,
    columns: [...columns],
    customComponents: {
      loc: LocString,
    },
  }
}
