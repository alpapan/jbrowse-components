import { getEnv, getSession } from '@jbrowse/core/util'
import { locationLinkClick } from '../components/util'
import { SpreadsheetModel } from '../models/Spreadsheet'
import { getParent } from 'mobx-state-tree'
import VCF from '@gmod/vcf'
import { VcfFeature } from '@jbrowse/plugin-variants'
import BreakpointSplitViewType from '@jbrowse/plugin-breakpoint-split-view/src/BreakpointSplitView/BreakpointSplitView'

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

export async function launchLinearGenomeView({
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
  row,
  vcfParser,
}: {
  model: SpreadsheetModel
  row: Record<string, unknown>
  vcfParser: VCF
}) {
  try {
    const session = getSession(model)
    const { pluginManager } = getEnv(model)
    const { assemblyName } = model
    if (!assemblyName) {
      throw new Error('assemblyName not set')
    }
    const viewType = pluginManager.getViewType(
      'BreakpointSplitView',
    ) as BreakpointSplitViewType
    const snap = await viewType.snapshotFromBreakendFeature(
      new VcfFeature({
        id: row.id as string,
        // eslint-disable-next-line no-underscore-dangle
        variant: vcfParser.parseLine(row.___lineData as string),
        parser: vcfParser,
      }),
      assemblyName,
      session,
    )
    const v = getParent<{ width: number }>(model)
    snap.views[0].offsetPx -= v.width / 2 + 100
    snap.views[1].offsetPx -= v.width / 2 + 100

    session.addView('BreakpointSplitView', snap)
  } catch (e) {
    console.error(e)
    getSession(model).notify(`${e}`, 'error')
  }
}

export async function launchLinearGenomeViewWithEndFocus({
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
