import React, { useMemo, useState } from 'react'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import { ErrorMessage, LoadingEllipses } from '@jbrowse/core/ui'
import { useResizeBar } from '@jbrowse/core/ui/useResizeBar'
import ResizeBar from '@jbrowse/core/ui/ResizeBar'
import { getSession, measureGridWidth } from '@jbrowse/core/util'
import { Link } from '@mui/material'
import { getParent } from 'mobx-state-tree'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

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

type LGV = LinearGenomeViewModel
type MaybeLGV = LinearGenomeViewModel | undefined

async function locationLinkClick(
  spreadsheet: SpreadsheetModel,
  locString: string,
) {
  const session = getSession(spreadsheet)
  const { assemblyName } = spreadsheet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { id } = getParent<any>(spreadsheet)

  const newViewId = `${id}_${assemblyName}`
  let view = session.views.find(v => v.id === newViewId) as MaybeLGV
  if (!view) {
    view = session.addView('LinearGenomeView', {
      id: newViewId,
    }) as LGV
  }
  await view.navToLocString(locString, assemblyName)
}

const DataTable = observer(function ({ model }: { model: SpreadsheetModel }) {
  const { ref, scrollLeft } = useResizeBar()
  const { rows, columns } = model.data!
  const w0 = useMemo(
    () => columns.map(e => measureGridWidth(rows.map(r => r[e]))),
    [columns, rows],
  )
  const [widths, setWidths] = useState(w0)
  const [error, setError] = useState<unknown>()

  return (
    <div ref={ref}>
      {error ? <ErrorMessage error={error} /> : undefined}
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
        columns={columns.map((m, i) => ({
          field: m,
          width: widths[i],
          renderCell:
            m === 'loc'
              ? args => (
                  <Link
                    href="#"
                    onClick={async event => {
                      try {
                        event.preventDefault()
                        await locationLinkClick(model, args.value)
                      } catch (e) {
                        console.error(e)
                        setError(e)
                      }
                    }}
                  >
                    {args.value}
                  </Link>
                )
              : undefined,
        }))}
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
