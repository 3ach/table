import { useEffect, useState } from 'react'
import './App.css'

import TableLayout from './components/TableLayout';
import TableEditor from './components/TableEditor';
import { Table } from './models/Table';
import SVGDownloadButton from './components/SVGDownloadButton';
import TableConfigButtons from './components/TableConfigButtons';
import { loadTable, saveTable } from './lib/storage';

function App() {
  // Start from whatever was last used in this browser, falling back to the
  // stock table, and write every change back.
  const [table, setTable] = useState<Table>(loadTable);

  useEffect(() => saveTable(table), [table]);

  const strokeWidth = 1;

  return (
    <>
      <div className="inline-flex flex-col h-screen max-h-screen">
        <div className="inline-block">
          <TableEditor table={table} updateTable={setTable} />
          <SVGDownloadButton className="real-size-layout" units={table.units} />
          <TableConfigButtons table={table} updateTable={setTable} />
        </div>
	  	<p>Calibration square is {table.calibrationSquareSize} {table.units}</p>
      <hr className="p-3 w-screen"/>
      <div className='grow' id='real-size-layout'>
        <TableLayout table={table} strokeWidth={strokeWidth} />
      </div>
      </div>
    </>
  )
}

export default App
