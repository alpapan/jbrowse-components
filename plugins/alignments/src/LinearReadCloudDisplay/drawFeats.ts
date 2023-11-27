import { getContainingView, getSession } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// locals
import { LinearReadCloudDisplayModel } from './model'
import { hasPairedReads } from '../shared/util'
import { drawPairFeatures } from './drawPairFeatures'
import { drawLongReadFeatures } from './drawLongReadFeatures'

type LGV = LinearGenomeViewModel

export function drawFeats({
  model,
  ctx,
}: {
  model: LinearReadCloudDisplayModel
  ctx: CanvasRenderingContext2D
}) {
  const { featureData } = model
  if (!featureData) {
    return
  }
  const { assemblyManager } = getSession(model)
  const view = getContainingView(model) as LGV
  const assemblyName = view.assemblyNames[0]
  const asm = assemblyManager.get(assemblyName)
  if (!asm) {
    return
  }

  const hasPaired = hasPairedReads(featureData)

  if (hasPaired) {
    drawPairFeatures({ model, view, asm, ctx, featureData })
  } else {
    drawLongReadFeatures({ model, view, asm, ctx, featureData })
  }
}
