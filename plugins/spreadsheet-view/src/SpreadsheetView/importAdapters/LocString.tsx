import React from 'react'
import { Link } from '@mui/material'
import CascadingMenuButton from '@jbrowse/core/ui/CascadingMenuButton'

// icons
import MoreHoriz from '@mui/icons-material/MoreHoriz'
// locals
import { locationLinkClick } from '../components/util'
import { SpreadsheetModel } from '../models/Spreadsheet'
import { MenuItem } from '@jbrowse/core/ui'

export default function LocString({
  value,
  model,
  row,
  getMenuItems,
  setError,
}: {
  value: string
  model: SpreadsheetModel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMenuItems: (row: any[]) => MenuItem[]
  setError: (e: unknown) => void
}) {
  return (
    <Link
      href="#"
      onClick={async event => {
        try {
          event.preventDefault()
          await locationLinkClick(model, value)
        } catch (e) {
          console.error(e)
          setError(e)
        }
      }}
    >
      {value}{' '}
      <CascadingMenuButton menuItems={getMenuItems(row)}>
        <MoreHoriz />
      </CascadingMenuButton>
    </Link>
  )
}
