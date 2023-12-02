import { getSession } from '@jbrowse/core/util'
import { getParent } from 'mobx-state-tree'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

type LGV = LinearGenomeViewModel
type MaybeLGV = LinearGenomeViewModel | undefined

// locals
import { SpreadsheetModel } from '../models/Spreadsheet'

function letterFor(n: number) {
  return String.fromCharCode(n + 65)
}

export function numToColName(num: number) {
  if (num >= 0) {
    if (num < 26) {
      return letterFor(num)
    }
    if (num < 27 * 26) {
      return letterFor(Math.floor(num / 26 - 1)) + letterFor(num % 26)
    }
  }

  throw new RangeError('column number out of range')
}
export async function locationLinkClick(
  spreadsheet: SpreadsheetModel,
  locString: string,
) {
  const session = getSession(spreadsheet)
  const { assemblyName } = spreadsheet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = getParent<any>(spreadsheet)

  const newViewId = `${id}_${assemblyName}`
  let view = session.views.find(v => v.id === newViewId) as MaybeLGV
  if (!view) {
    view = session.addView('LinearGenomeView', {
      id: newViewId,
    }) as LGV
  }
  await view.navToLocString(locString, assemblyName)
}
