import React, { Suspense, lazy, useState } from 'react'
import { Link, Typography } from '@mui/material'
import {
  getEnv,
  getSession,
  SimpleFeature,
  SimpleFeatureSerialized,
} from '@jbrowse/core/util'
import { BaseCard } from '@jbrowse/core/BaseFeatureWidget/BaseFeatureDetail'
import { IAnyStateTreeNode } from 'mobx-state-tree'

// lazies
const BreakendOptionDialog = lazy(() => import('./BreakendOptionDialog'))

export default function BreakendPanel(props: {
  locStrings: string[]
  model: IAnyStateTreeNode
  feature: SimpleFeatureSerialized
}) {
  const { model, locStrings, feature } = props

  return (
    <BaseCard {...props} title="Breakends">
      <LaunchLinearGenomeViewFromVariantFeature
        locStrings={locStrings}
        model={model}
      />
      <LaunchBreakpointSplitViewFromVariantFeature
        model={model}
        locStrings={locStrings}
        feature={feature}
      />
    </BaseCard>
  )
}

function LaunchLinearGenomeViewFromVariantFeature({
  locStrings,
  model,
}: {
  locStrings: string[]
  model: IAnyStateTreeNode
}) {
  return (
    <>
      <Typography>Link to linear view of breakend endpoints</Typography>
      <ul>
        {locStrings.map(locString => (
          <li key={`${JSON.stringify(locString)}`}>
            <Link
              href="#"
              onClick={event => {
                event.preventDefault()
                const { view } = model
                try {
                  if (view) {
                    view.navToLocString?.(locString)
                  } else {
                    throw new Error(
                      'No view associated with this feature detail panel anymore',
                    )
                  }
                } catch (e) {
                  console.error(e)
                  getSession(model).notify(`${e}`)
                }
              }}
            >
              {`LGV - ${locString}`}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function LaunchBreakpointSplitViewFromVariantFeature({
  feature,
  model,
  locStrings,
}: {
  model: IAnyStateTreeNode
  feature: SimpleFeatureSerialized
  locStrings: string[]
}) {
  const [breakpointDialog, setBreakpointDialog] = useState(false)
  const session = getSession(model)
  const { pluginManager } = getEnv(session)
  const simpleFeature = new SimpleFeature(feature)
  let viewType

  try {
    viewType = pluginManager.getViewType('BreakpointSplitView')
  } catch (e) {
    // ignore
  }

  return viewType ? (
    <div>
      <Typography>
        Launch split views with breakend source and target
      </Typography>
      <ul>
        {locStrings.map(locString => (
          <li key={`${JSON.stringify(locString)}`}>
            <Link
              href="#"
              onClick={event => {
                event.preventDefault()
                setBreakpointDialog(true)
              }}
            >
              {`${feature.refName}:${feature.start} // ${locString} (split view)`}
            </Link>
          </li>
        ))}
      </ul>
      {breakpointDialog ? (
        <Suspense fallback={null}>
          <BreakendOptionDialog
            model={model}
            viewType={viewType}
            feature={simpleFeature}
            handleClose={() => setBreakpointDialog(false)}
          />
        </Suspense>
      ) : null}
    </div>
  ) : null
}
