import { getSession } from '@jbrowse/core/util'
import { locationLinkClick } from '../components/util'
import { SpreadsheetModel } from '../models/Spreadsheet'

export function parseStrand(strand: string) {
  if (strand === '+') {
    return 1
  } else if (strand === '-') {
    return -1
  } else if (strand === '.') {
    return 0
  } else {
    return undefined
  }
}

export async function launchLGV({
  model,
  value,
}: {
  model: SpreadsheetModel
  value: string
}) {
  try {
    await locationLinkClick(model, value)
  } catch (e) {
    console.error(e)
    getSession(model).notify(`${e}`, 'error')
  }
}

export async function launchBreakpointSplitView({
  model,
  value,
}: {
  model: SpreadsheetModel
  value: string
}) {
  try {
    await locationLinkClick(model, value)
  } catch (e) {
    console.error(e)
    getSession(model).notify(`${e}`, 'error')
  }
}
