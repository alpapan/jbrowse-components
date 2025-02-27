import React, { useEffect, useState } from 'react'
import {
  Button,
  DialogActions,
  DialogContent,
  Link,
  Typography,
} from '@mui/material'

import { RawSourceMap, SourceMapConsumer } from 'source-map-js'
import copy from 'copy-to-clipboard'

// locals
import Dialog from './Dialog'
import LoadingEllipses from './LoadingEllipses'

// produce a source-map resolved stack trace
// reference code https://stackoverflow.com/a/77158517/2129219
const sourceMaps: Record<string, RawSourceMap> = {}
async function getSourceMapFromUri(uri: string) {
  if (sourceMaps[uri] != undefined) {
    return sourceMaps[uri]
  }
  const uriQuery = new URL(uri).search
  const currentScriptContent = await (await fetch(uri)).text()

  let mapUri =
    new RegExp(/\/\/# sourceMappingURL=(.*)/).exec(currentScriptContent)?.[1] ||
    ''
  mapUri = new URL(mapUri, uri).href + uriQuery

  const map = await (await fetch(mapUri)).json()

  sourceMaps[uri] = map

  return map
}

async function mapStackTrace(stack: string) {
  const stackLines = stack.split('\n')
  const mappedStack = []

  for (const line of stackLines) {
    const match = new RegExp(/(.*)(http:\/\/.*):(\d+):(\d+)/).exec(line)
    if (match === null) {
      mappedStack.push(line)
      continue
    }

    const uri = match[2]
    const consumer = new SourceMapConsumer(await getSourceMapFromUri(uri))

    const originalPosition = consumer.originalPositionFor({
      line: parseInt(match[3]),
      column: parseInt(match[4]),
    })

    if (
      originalPosition.source === null ||
      originalPosition.line === null ||
      originalPosition.column === null
    ) {
      mappedStack.push(line)
      continue
    }

    mappedStack.push(
      `${originalPosition.source}:${originalPosition.line}:${
        originalPosition.column + 1
      }`,
    )
  }

  return mappedStack.join('\n')
}

const MAX_ERR_LEN = 10_000

// Chrome has the error message in the stacktrace, firefox doesn't
function stripMessage(trace: string, error: unknown) {
  if (trace.startsWith('Error:')) {
    // remove the error message, which can be very long due to mobx-state-tree
    // stuff, to get just the stack trace
    const err = `${error}`
    return trace.slice(err.length)
  } else {
    return trace
  }
}

export default function ErrorMessageStackTraceDialog({
  error,
  onClose,
}: {
  onClose: () => void
  error: Error
}) {
  const [mappedStackTrace, setMappedStackTrace] = useState<string>()
  const [secondaryError, setSecondaryError] = useState<unknown>()
  const [clicked, setClicked] = useState(false)
  const stackTracePreProcessed = `${error.stack}`
  const errorText = `${error}`
  const stackTrace = stripMessage(stackTracePreProcessed, errorText)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ;(async () => {
      try {
        const res = await mapStackTrace(stackTrace)
        setMappedStackTrace(res)
      } catch (e) {
        console.error(e)
        setMappedStackTrace(stackTrace)
        setSecondaryError(e)
      }
    })()
  }, [stackTrace])

  const errorBoxText = [
    secondaryError
      ? 'Error loading source map, showing raw stack trace below:'
      : '',
    errorText.length > MAX_ERR_LEN
      ? errorText.slice(0, MAX_ERR_LEN) + '...'
      : errorText,
    mappedStackTrace || 'No stack trace available',
    // @ts-expect-error add version info at bottom if we are in jbrowse-web
    window.JBrowseSession ? `JBrowse ${window.JBrowseSession.version}` : '',
  ].join('\n')

  const err = encodeURIComponent(
    'I got this error from JBrowse, here is the stack trace:\n\n```\n' +
      errorBoxText +
      '\n```\n',
  )
  const githubLink = `https://github.com/GMOD/jbrowse-components/issues/new?labels=bug&title=JBrowse+issue&body=${err}`
  const emailLink = `mailto:jbrowse2dev@gmail.com?subject=JBrowse%202%20error&body=${err}`
  return (
    <Dialog open onClose={onClose} title="Stack trace" maxWidth="xl">
      <DialogContent>
        {mappedStackTrace === undefined ? (
          <LoadingEllipses variant="h6" />
        ) : (
          <>
            <Typography>
              Post a new issue at{' '}
              <Link href={githubLink} target="_blank">
                GitHub
              </Link>{' '}
              or send an email to{' '}
              <Link href={emailLink} target="_blank">
                jbrowse2dev@gmail.com
              </Link>{' '}
            </Typography>
            <pre
              style={{
                background: 'lightgrey',
                border: '1px solid black',
                overflow: 'auto',
                margin: 20,
                maxHeight: 300,
              }}
            >
              {errorBoxText}
            </pre>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            copy(errorBoxText)
            setClicked(true)
            setTimeout(() => setClicked(false), 1000)
          }}
        >
          {clicked ? 'Copied!' : 'Copy stack trace to clipboard'}
        </Button>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
