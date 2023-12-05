import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'
import { ResizeHandle } from '@jbrowse/core/ui'

// locals
import { SvInspectorViewModel } from '../models/SvInspectorView'
import CircularViewOptions from './CircularViewOptions'

const useStyles = makeStyles()(theme => ({
  resizeHandleVert: {
    background: theme.palette.action.selected,
    width: 4,
    boxSizing: 'border-box',
    borderTop: '1px solid #fafafa',
  },
  resizeHandleHoriz: {
    background: theme.palette.action.selected,
    height: 4,
    boxSizing: 'border-box',
    borderTop: '1px solid #fafafa',
  },
  viewControls: {
    margin: 0,
  },
  viewsContainer: {
    display: 'flex',
  },
  container: {
    overflow: 'hidden',
  },
}))

const SvInspectorView = observer(function ({
  model,
}: {
  model: SvInspectorViewModel
}) {
  const { classes } = useStyles()

  const {
    SpreadsheetViewReactComponent,
    CircularViewReactComponent,
    spreadsheetView,
    circularView,
    showCircularView,
  } = model
  const [initialCircWidth, setInitialCircWidth] = useState(0)
  const [initialSpreadsheetWidth, setInitialSpreadsheetWidth] = useState(0)
  console.log({ showCircularView })

  return (
    <div className={classes.container}>
      <div className={classes.viewsContainer}>
        <div
          style={{ width: spreadsheetView.width }}
          className={classes.container}
        >
          <SpreadsheetViewReactComponent model={spreadsheetView} />
        </div>

        {showCircularView ? (
          <>
            <ResizeHandle
              onDrag={(_, total) => {
                circularView.resizeWidth(initialCircWidth - total)
                spreadsheetView.resizeWidth(initialSpreadsheetWidth + total)
              }}
              onMouseDown={() => {
                setInitialSpreadsheetWidth(spreadsheetView.width)
                setInitialCircWidth(circularView.width)
              }}
              vertical
              flexbox
              className={classes.resizeHandleVert}
            />
            <div style={{ width: circularView.width }}>
              <CircularViewOptions svInspector={model} />
              <CircularViewReactComponent model={circularView} />
            </div>
          </>
        ) : null}
      </div>
      <ResizeHandle
        onDrag={model.resizeHeight}
        className={classes.resizeHandleHoriz}
      />
    </div>
  )
})

export default SvInspectorView
