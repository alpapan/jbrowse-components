import React from 'react'
import { Link } from '@mui/material'
import CascadingMenuButton from '@jbrowse/core/ui/CascadingMenuButton'

// icons
import MoreHoriz from '@mui/icons-material/MoreHoriz'
// locals
import { locationLinkClick } from '../components/util'
import { SpreadsheetModel } from '../models/Spreadsheet'

export default function LocString({
  value,
  model,
  row,
  setError,
}: {
  value: string
  model: SpreadsheetModel
  row: any[]
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
      <CascadingMenuButton menuItems={getMenuItems()}>
        <MoreHoriz />
      </CascadingMenuButton>
    </Link>
  )
}
