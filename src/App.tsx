import { useState } from 'react'
import './App.css'

import TableLayout from './components/TableLayout';
import TableEditor from './components/TableEditor';
import { Table } from './models/Table';
import SVGDownloadButton from './components/SVGDownloadButton';

function App() {
  const [table, setTable] = useState<Table>({
    xCut: 49,
    yCut: 97,
    xSparGap: 12,
    ySparGap: 12,
    thickness: 3,
    material: 0.75,
    overhang: 1,  
    units: "in",
  });

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
