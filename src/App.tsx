import { useState } from 'react'
import './App.css'

import TableLayout from './components/TableLayout';
import TableEditor from './components/TableEditor';
import { Table } from './models/Table';
import SVGDownloadButton from './components/SVGDownloadButton';

function App() {
  const [table, setTable] = useState<Table>(new Table(
    49,
    97,
    12,
    12,
    3,
    0.75,
    1,
    4,
    "in",
    "LR4",
  ));

  const strokeWidth = 1;

  return (
    <>
      <div className="inline-flex flex-col h-screen max-h-screen">
        <div className="inline-block">
          <TableEditor table={table} updateTable={setTable} />
          <SVGDownloadButton className="real-size-layout" />
        </div>
      <hr className="p-3 w-screen"/>
      <div className='grow' id='real-size-layout'>
        <TableLayout table={table} strokeWidth={strokeWidth} />
      </div>
      </div>
    </>
  )
}

export default App
