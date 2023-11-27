import { getContainingView } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// locals
import { createAutorun } from '../util'
import { fetchFeatures } from './fetchFeatures'
import { LinearReadCloudDisplayModel } from '../LinearReadCloudDisplay/model'
import { LinearReadArcsDisplayModel } from '../LinearReadArcsDisplay/model'

type LGV = LinearGenomeViewModel

export function fetchFeaturesAutorun(
  model: LinearReadArcsDisplayModel | LinearReadCloudDisplayModel,
) {
  createAutorun(
    model,
    async () => {
      await fetchFeatures(model)
    },
    { delay: 1000 },
  )
}

interface AnyLinearAlignmentsDisplay {
  setError: (e: unknown) => void
  lastDrawnOffsetPx: number | undefined
  lastDrawnBpPerPx: number | undefined
  setLastDrawnOffsetPx: (arg: number) => void
  setLastDrawnBpPerPx: (arg: number) => void
  height: number
  featureData: unknown
  ref: HTMLCanvasElement | null
}

type DrawFeaturesCallback<T> = (arg: {
  model: T
  ctx: CanvasRenderingContext2D
  width: number
  height: number
}) => void

function draw<T extends AnyLinearAlignmentsDisplay>(
  model: T,
  view: LGV,
  cb: DrawFeaturesCallback<T>,
) {
  const canvas = model.ref
  if (!canvas) {
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  if (!model.featureData) {
    return
  }

  ctx.clearRect(0, 0, canvas.width, model.height * 2)
  ctx.resetTransform()
  ctx.scale(2, 2)
  cb({ model, ctx, width: canvas.width, height: model.height })
  model.setLastDrawnOffsetPx(view.offsetPx)
  model.setLastDrawnBpPerPx(view.bpPerPx)
}

export function drawAutorun<T extends AnyLinearAlignmentsDisplay>(
  model: T,
  cb: DrawFeaturesCallback<T>,
) {
  // first autorun instantly draws if bpPerPx changes
  createAutorun(model, async () => {
    const view = getContainingView(model) as LGV
    if (view.bpPerPx !== model.lastDrawnBpPerPx) {
      draw(model, view, cb)
    }
  })

  // second autorun draws after delay 1000 e.g. if offsetPx changes
  createAutorun(
    model,
    async () => {
      const view = getContainingView(model) as LGV
      draw(model, view, cb)
    },
    { delay: 1000 },
  )
}
