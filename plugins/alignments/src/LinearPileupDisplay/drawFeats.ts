import { Feature, getContainingView, getSession } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'
import { Theme } from '@mui/material'
// locals
import { LinearPileupDisplayModel } from './model'
import { renderAlignment } from '../PileupRenderer/renderAlignment'
import {
  getCharWidthHeight,
  getColorBaseMap,
  getContrastBaseMap,
} from '../PileupRenderer/util'

type LGV = LinearGenomeViewModel

export function drawFeats({
  model,
  ctx,
  width,
}: {
  model: LinearPileupDisplayModel
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}) {
  const { theme } = getSession(model)
  const { colorBy, colorTagMap, featureData: features } = model
  if (!features) {
    return
  }
  const view = getContainingView(model) as LGV
  const { assemblyNames, bpPerPx } = view
  const { assemblyManager } = getSession(model)
  const asm = assemblyManager.get(assemblyNames[0])
  if (!asm || !model.featureData) {
    return
  }

  const colorForBase = getColorBaseMap(theme)
  const contrastForBase = getContrastBaseMap(theme)
  const { charWidth, charHeight } = getCharWidthHeight()
  for (const rect of model.layout.rectangles.values()) {
    renderAlignment({
      ctx,
      colorForBase,
      contrastForBase,
      feat: {
        heightPx: rect.originalHeight - 3,
        topPx: rect.top! * 8,
        feature: rect.data as Feature,
      },
      regions: view.dynamicBlocks.contentBlocks,
      config: model.rendererConfig,
      charWidth,
      charHeight,
      canvasWidth: width,
      bpPerPx,
      colorBy,
      colorTagMap,
    })
    // strokeRectCtx(l - view.offsetPx, top, w, featureHeight - 1, ctx, 'grey')
    // fillRectCtx(l - view.offsetPx, top, w, featureHeight - 1, ctx, 'grey')
  }
}
