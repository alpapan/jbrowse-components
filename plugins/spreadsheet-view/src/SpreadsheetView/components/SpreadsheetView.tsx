import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { observer } from 'mobx-react'
import { ResizeHandle } from '@jbrowse/core/ui'

// locals
import ImportWizard from './ImportWizard'
import Spreadsheet from './Spreadsheet'
import { SpreadsheetViewModel } from '../models/SpreadsheetView'

const headerHeight = 52
const statusBarHeight = 40

const useStyles = makeStyles()(theme => ({
  contentArea: {
    overflow: 'auto',
  },
  resizeHandle: {
    height: 5,
    boxSizing: 'border-box',
    background: theme.palette.action.disabled,
    borderTop: '1px solid #fafafa',
  },
}))

const SpreadsheetView = observer(function ({
  model,
}: {
  model: SpreadsheetViewModel
}) {
  const [initialHeight, setInitialHeight] = useState<number>(0)
  const { classes } = useStyles()
  const { spreadsheet, hideVerticalResizeHandle, height } = model
  console.log({
    initialHeight,
  })
  return (
    <div>
      <div style={{ height, overflow: 'auto' }}>
        {!spreadsheet.data ? (
          <ImportWizard model={model.importWizard} />
        ) : (
          <div className={classes.contentArea}>
            <Spreadsheet model={spreadsheet} />
          </div>
        )}
      </div>

      {hideVerticalResizeHandle ? null : (
        <ResizeHandle
          onMouseDown={() => setInitialHeight(height)}
          onDrag={(_, totalDist) => model.setHeight(initialHeight - totalDist)}
          className={classes.resizeHandle}
        />
      )}
    </div>
  )
})

export default SpreadsheetView
