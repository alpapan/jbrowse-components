import { LayoutFeature } from './util'

import { getAlignmentShapeColor } from './getAlignmentShapeColor'
import { renderAlignmentShape } from './renderAlignmentShape'
import { renderPerBaseQuality } from './renderPerBaseQuality'
import { renderPerBaseLettering } from './renderPerBaseLettering'
import { renderModifications } from './renderModifications'
import { renderMethylation } from './renderMethylation'
import { AnyConfigurationModel } from '@jbrowse/core/configuration'

export function renderAlignment({
  ctx,
  feat,
  colorForBase,
  contrastForBase,
  charWidth,
  charHeight,
  canvasWidth,
  bpPerPx,
  colorBy,
  colorTagMap,
  regions,
  config,
}: {
  ctx: CanvasRenderingContext2D
  feat: LayoutFeature
  colorForBase: Record<string, string>
  contrastForBase: Record<string, string>
  charWidth: number
  charHeight: number
  canvasWidth: number
  bpPerPx: number
  colorBy: any
  colorTagMap: any
  regions: any
  config: AnyConfigurationModel
}) {
  const { tag = '', type: colorType = '' } = colorBy || {}
  const { feature } = feat
  const region = regions[0]

  ctx.fillStyle = getAlignmentShapeColor({
    feature,
    config,
    tag,
    colorType,
    colorTagMap,
  })

  renderAlignmentShape({ ctx, feat, bpPerPx, regions })

  // second pass for color types that render per-base things that go over the
  // existing drawing
  switch (colorType) {
    case 'perBaseQuality':
      renderPerBaseQuality({
        ctx,
        feat,
        region,
        bpPerPx,
        canvasWidth,
      })
      break

    case 'perBaseLettering':
      renderPerBaseLettering({
        ctx,
        feat,
        region,
        bpPerPx,
        colorForBase,
        contrastForBase,
        charWidth,
        charHeight,
        canvasWidth,
      })
      break

    case 'modifications':
      renderModifications({
        ctx,
        feat,
        region,
        bpPerPx,
        canvasWidth,
        modificationTagMap: undefined,
      })
      break

    case 'methylation':
      renderMethylation({
        ctx,
        feat,
        region,
        bpPerPx,
        canvasWidth,
      })
      break
  }
}
