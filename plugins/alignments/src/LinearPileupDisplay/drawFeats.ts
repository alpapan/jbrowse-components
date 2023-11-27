import { Feature, getContainingView, getSession } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

import { LinearPileupDisplayModel } from './model'
import { renderAlignment } from '../PileupRenderer/renderAlignment'
import { getCharWidthHeight } from '../PileupRenderer/util'

type LGV = LinearGenomeViewModel

export function drawFeats(
  self: LinearPileupDisplayModel,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const { colorBy, colorTagMap, featureData: features } = self
  if (!features) {
    return
  }
  const view = getContainingView(self) as LGV
  const { assemblyNames, bpPerPx } = view
  const { assemblyManager } = getSession(self)
  const asm = assemblyManager.get(assemblyNames[0])
  if (!asm || !self.featureData) {
    return
  }

  const { charWidth, charHeight } = getCharWidthHeight()
  for (const [id, rect] of self.layout.rectangles.entries()) {
    renderAlignment({
      ctx,
      feat: rect.data as Feature,
      charWidth,
      charHeight,
      width,
      bpPerPx,
      colorBy,
      colorTagMap,
    })
    // strokeRectCtx(l - view.offsetPx, top, w, featureHeight - 1, ctx, 'grey')
    // fillRectCtx(l - view.offsetPx, top, w, featureHeight - 1, ctx, 'grey')
  }
}
