import React, { useMemo, useState } from 'react'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { ErrorMessage, LoadingEllipses, ResizeBar } from '@jbrowse/core/ui'
import { useResizeBar } from '@jbrowse/core/ui/useResizeBar'
import { measureGridWidth } from '@jbrowse/core/util'

// locals
import { SpreadsheetModel } from '../models/Spreadsheet'

const useStyles = makeStyles()(theme => ({
  root: {
    position: 'relative',
    marginBottom: theme.spacing(1),
    background: theme.palette.background.paper,
    overflow: 'auto',
  },
}))

const DataTable = observer(function ({ model }: { model: SpreadsheetModel }) {
  const { ref, scrollLeft } = useResizeBar()
  const { rows, columns, CustomComponents } = model.data!
  const w0 = useMemo(
    () => columns.map(e => measureGridWidth(rows.map(r => r[e]))),
    [columns, rows],
  )
  const [widths, setWidths] = useState(w0)
  const [error, setError] = useState<unknown>()

  return (
    <div ref={ref}>
      {error ? (
        <ErrorMessage error={error} clearError={() => setError(undefined)} />
      ) : undefined}
      <ResizeBar
        widths={widths}
        setWidths={setWidths}
        scrollLeft={scrollLeft}
      />
      <DataGrid
        columnHeaderHeight={35}
        rowHeight={25}
        hideFooter={rows.length < 100}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        // @ts-expect-error
        rows={rows}
        columns={columns.map((m, i) => {
          const res = CustomComponents?.[m]
          return {
            field: m,
            width: widths[i],
            renderCell: res
              ? args => (
                  <res.Component
                    setError={setError}
                    value={args.value}
                    model={model}
                    row={args.row}
                    {...res.props}
                  />
                )
              : undefined,
          }
        })}
      />
    </div>
  )
})

const Spreadsheet = observer(function ({ model }: { model: SpreadsheetModel }) {
  const { classes } = useStyles()
  return (
    <div className={classes.root}>
      {model?.data ? (
        <DataTable model={model} />
      ) : (
        <LoadingEllipses variant="h6" />
      )}
    </div>
  )
})

export default Spreadsheet
