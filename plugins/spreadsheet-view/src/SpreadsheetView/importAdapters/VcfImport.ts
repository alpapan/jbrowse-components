import VCF from '@gmod/vcf'
import { assembleLocString } from '@jbrowse/core/util'

// locals
import LocString from './components/LocString'
import { launchBreakpointSplitView, launchLGV } from './util'
import { SpreadsheetModel } from '../models/Spreadsheet'

type Row = Record<string, unknown>

export function parseVcfBuffer(buffer: Buffer) {
  const str = new TextDecoder('utf8').decode(buffer)
  const lines = str
    .split(/\n|\r\n/)
    .map(f => f.trim())
    .filter(f => !!f)
  const headerLines = []
  let i = 0
  for (; i < lines.length && lines[i].startsWith('#'); i++) {
    headerLines.push(lines[i])
  }
  const header = headerLines.join('\n')
  const vcfParser = new VCF({ header })
  const keys = new Set<string>()
  const rows = lines.slice(i).map((l, id) => {
    const [CHROM, POS, ID, REF, ALT, QUAL, FILTER, INFO, FORMAT] = l.split('\t')
    const ret = Object.fromEntries(
      INFO?.split(';')
        .map(f => f.trim())
        .map(e => {
          const [key, val = 'true'] = e.split('=')
          const k = `INFO.${key.trim()}`
          keys.add(k)
          return [k, val.trim()]
        }) || [],
    )
    const start = +POS
    const s1 = start + 1
    return {
      loc: assembleLocString({
        refName: CHROM,
        start,
        end: ret['INFO.CHR2'] ? s1 : +ret['INFO.END'] ?? s1,
      }),
      CHROM,
      POS: start,
      ID,
      REF,
      ALT,
      QUAL,
      FILTER,
      FORMAT,
      id,
      ___lineData: l,
      ...ret,
    }
  })

  return {
    vcfParser,
    rows,
    columns: [
      'loc',
      'CHROM',
      'POS',
      'ID',
      'REF',
      'ALT',
      'QUAL',
      'FILTER',
      'FORMAT',
      ...keys,
    ],
    CustomComponents: {
      loc: {
        Component: LocString,
        props: {
          getMenuItems: ({
            model,
            row,
          }: {
            model: SpreadsheetModel
            row: Row
          }) => [
            {
              label: 'Launch linear genome view',
              onClick: () => launchLGV({ model, value: row.loc as string }),
            },
            {
              label: 'Launch breakpoint split view',
              onClick: () =>
                launchBreakpointSplitView({ model, row, vcfParser }),
            },
          ],
        },
      },
    },
  }
}
