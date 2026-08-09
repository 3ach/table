import { Suspense, lazy, useEffect, useState } from 'react'
import './App.css'

import TableLayout from './components/TableLayout';
import TableEditor from './components/TableEditor';
import { Table } from './models/Table';
import SVGDownloadButton from './components/SVGDownloadButton';
import TableConfigButtons from './components/TableConfigButtons';
import ViewToggleButton from './components/ViewToggleButton';
import { loadTable, saveTable } from './lib/storage';

// three.js and its React bindings are several times the size of the rest of the
// app, and most visits never leave the cut sheet. Load them the first time
// someone asks for the 3D view instead of on every page load.
const Table3DView = lazy(() => import('./components/Table3DView'));

function App() {
  // Start from whatever was last used in this browser, falling back to the
  // stock table, and write every change back.
  const [table, setTable] = useState<Table>(loadTable);
  const [view3D, setView3D] = useState(false);

  useEffect(() => saveTable(table), [table]);

  const strokeWidth = 1;

  return (
    <div className="flex h-screen">
      <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-gray-300 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-gray-900">Lowrider table</h1>
        <p className="mt-0.5 mb-4 text-xs text-gray-500">
          Settings are kept in this browser, so the table you were working on is
          still here next time.
        </p>

        <TableEditor table={table} updateTable={setTable} />

        <div className="mt-6 border-t border-gray-200 pt-4">
          <h2 className="text-sm font-semibold text-gray-900">Output</h2>
          <p className="mt-0.5 mb-2 text-xs text-gray-500">
            The SVG downloads at real-world size. Cut the calibration square
            first and measure it &mdash; it should come out at exactly{' '}
            {table.calibrationSquareSize} {table.units}.
          </p>
          <SVGDownloadButton className="real-size-layout" table={table} />
          <TableConfigButtons table={table} updateTable={setTable} />
          <div className="mt-2">
            <ViewToggleButton view3D={view3D} onToggle={() => setView3D(!view3D)} />
          </div>
        </div>

        <footer className="mt-auto pt-6 text-xs text-gray-500">
          Originally made by{' '}
          <a
            className="font-medium text-gray-700 hover:underline"
            href="https://github.com/3ach/table"
          >
            Zach Zundel
          </a>
          . 3D view by{' '}
          <a
            className="font-medium text-gray-700 hover:underline"
            href="https://github.com/jeyeager65"
          >
            jeyeager65
          </a>
          . This version by{' '}
          <a
            className="font-medium text-gray-700 hover:underline"
            href="https://github.com/avec-sans/torsion-box-table"
          >
            avec sans
          </a>
          .
        </footer>
      </aside>

      <main className="min-w-0 flex-1 overflow-hidden bg-gray-200 p-6">
        {/* The cut sheet stays mounted behind the 3D view: Download SVG reads
            the drawing straight out of the DOM, so hiding it beats unmounting
            it. */}
        <div id="real-size-layout" className={view3D ? 'hidden' : 'h-full'}>
          <TableLayout table={table} strokeWidth={strokeWidth} />
        </div>
        {view3D && (
          <div className="h-full">
            <Suspense fallback={<p className="text-sm text-gray-500">Loading the 3D view&hellip;</p>}>
              <Table3DView table={table} />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
