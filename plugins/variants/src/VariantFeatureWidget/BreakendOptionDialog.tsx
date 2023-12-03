import React, { useState } from 'react'
import { observer } from 'mobx-react'
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { IAnyStateTreeNode, getSnapshot } from 'mobx-state-tree'
import { Dialog } from '@jbrowse/core/ui'
import { getSession, Feature } from '@jbrowse/core/util'

const useStyles = makeStyles()({
  block: {
    display: 'block',
  },
})
interface AbstractView {
  tracks: IAnyStateTreeNode
  width: number
  assemblyNames: string[]
}

interface AbstractTrack {
  trackId: string
  [key: string]: unknown
}
function remapIds(arr: AbstractTrack[]) {
  return arr.map(v => ({
    ...v,
    id: `${v.trackId}-${Math.random()}`,
  }))
}
async function launchBreakpointSplitView({
  model,
  feature,
  mirrorTracks,
  viewType,
}: {
  feature: Feature
  model: { view: AbstractView }
  mirrorTracks: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewType: any
}) {
  const { view } = model
  const session = getSession(model)
  try {
    const [assemblyName] = view.assemblyNames
    const viewSnapshot = await viewType.snapshotFromBreakendFeature(
      feature,
      assemblyName,
      session,
    )

    viewSnapshot.views[0].offsetPx -= view.width / 2 + 100
    viewSnapshot.views[1].offsetPx -= view.width / 2 + 100
    viewSnapshot.featureData = feature
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const viewTracks = getSnapshot(view.tracks) as AbstractTrack[]
    viewSnapshot.views[0].tracks = remapIds(viewTracks)
    viewSnapshot.views[1].tracks = remapIds(
      mirrorTracks ? [...viewTracks].reverse() : viewTracks,
    )

    session.addView('BreakpointSplitView', viewSnapshot)
  } catch (e) {
    console.error(e)
    session.notify(`${e}`, 'error')
  }
}

const BreakendOptionDialog = observer(function ({
  model,
  handleClose,
  feature,
  viewType,
}: {
  model: { view: AbstractView }
  handleClose: () => void
  feature: Feature
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewType: any
}) {
  const { classes } = useStyles()
  const [copyTracks, setCopyTracks] = useState(true)
  const [mirrorTracks, setMirrorTracks] = useState(true)

  return (
    <Dialog open onClose={handleClose} title="Breakpoint split view options">
      <DialogContent>
        <FormControlLabel
          className={classes.block}
          control={
            <Checkbox
              checked={copyTracks}
              onChange={event => setCopyTracks(event.target.checked)}
            />
          }
          label="Copy tracks into the new view"
        />

        <FormControlLabel
          className={classes.block}
          control={
            <Checkbox
              checked={mirrorTracks}
              onChange={event => setMirrorTracks(event.target.checked)}
            />
          }
          label="Mirror tracks vertically in vertically stacked view"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            launchBreakpointSplitView({
              feature,
              model,
              mirrorTracks,
              viewType,
            })

            handleClose()
          }}
          variant="contained"
          color="primary"
          autoFocus
        >
          OK
        </Button>
        <Button
          onClick={() => handleClose()}
          color="secondary"
          variant="contained"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default BreakendOptionDialog
