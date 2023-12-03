import React from 'react'
import { getSession, measureGridWidth } from '@jbrowse/core/util'
import { autorun } from 'mobx'
import { addDisposer, types, Instance } from 'mobx-state-tree'

/**
 * #stateModel SpreadsheetViewSpreadsheet
 * #category view
 */
function x() {} // eslint-disable-line @typescript-eslint/no-unused-vars

export interface SpreadsheetData {
  rows: Record<string, unknown>[]
  columns: string[]
  CustomComponents?: Record<
    string,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Component: React.FC<any>
      props: Record<string, unknown>
    }
  >
}

function stateModelFactory() {
  return types
    .model('Spreadsheet', {
      /**
       * #property
       */
      assemblyName: types.maybe(types.string),
    })
    .volatile(() => ({
      data: undefined as SpreadsheetData | undefined,
      visible: {} as Record<string, boolean>,
      widths: {} as Record<string, number>,
    }))
    .views(self => ({
      /**
       * #getter
       */
      get initialized() {
        const session = getSession(self)
        const name = self.assemblyName
        return name ? session.assemblyManager.get(name)?.initialized : false
      },
    }))
    .actions(self => ({
      /**
       * #action
       */
      setVisible(args: Record<string, boolean>) {
        self.visible = args
      },
      /**
       * #action
       */
      setData(data?: SpreadsheetData, assemblyName?: string) {
        self.data = data
        self.assemblyName = assemblyName
      },
      /**
       * #action
       */
      setWidths(w: Record<string, number>) {
        self.widths = w
      },
    }))
    .views(self => ({
      /**
       * #getter
       */
      get columns() {
        if (self.data) {
          const { CustomComponents } = self.data
          return self.data?.columns.map(m => {
            const res = CustomComponents?.[m]
            return {
              field: m,
              width: self.widths[m],
              renderCell: res
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (args: { value: string; row: any[] }) => (
                    <res.Component
                      value={args.value}
                      model={self}
                      row={args.row}
                      {...res.props}
                    />
                  )
                : undefined,
            }
          })
        }
        return undefined
      },

      get widthList() {
        return Object.values(self.widths).map(f => f ?? 100)
      },
    }))

    .actions(self => ({
      afterAttach() {
        addDisposer(
          self,
          autorun(async () => {
            const session = getSession(self)
            const { assemblyManager } = session
            try {
              if (self.assemblyName) {
                await assemblyManager.waitForAssembly(self.assemblyName)
              }
            } catch (error) {
              console.error(error)
              session.notify(
                `failed to load assembly ${self.assemblyName} ${error}`,
                'error',
              )
            }
          }),
        )
        addDisposer(
          self,
          autorun(() => {
            if (self.data) {
              self.setVisible(
                Object.fromEntries(self.data.columns.map(c => [c, true])),
              )
            }
          }),
        )
        addDisposer(
          self,
          autorun(() => {
            if (self.data) {
              const { rows, columns } = self.data
              const widths = Object.fromEntries(
                columns
                  .filter(f => self.visible[f])
                  .map(e => [e, measureGridWidth(rows.map(r => r[e]))]),
              )
              self.setWidths(widths)
            }
          }),
        )
      },
    }))
}

export type SpreadsheetStateModel = ReturnType<typeof stateModelFactory>
export type SpreadsheetModel = Instance<SpreadsheetStateModel>

export default stateModelFactory
