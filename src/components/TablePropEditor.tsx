import { Table, TableEditable } from "../models/Table"
import { useState } from "react";

type TablePropEditorProps = {
    table: Table,
    itemName: string,
    propName: keyof TableEditable,
    updateTable: (c: Table) => void,
}

export default function TablePropEditor(props: TablePropEditorProps) {
    let [value, setValue] = useState(props.table[props.propName].toString());
    let [pending, setPending] = useState(false);
    console.log(`Rerendering. ${value}`)

    const update = (valueStr: string) => {
        const val = parseFloat(valueStr);
        setPending(false);
        props.table[props.propName] = val;
        props.updateTable(props.table)
    }

    const updateIfEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (e.key == 'Enter') {
            update(target.value)
        }
    }

    let currentValue = pending ? value : props.table[props.propName];

    return (
        <>
            <label className="block mb-2 text-sm font-medium text-gray-900">
                {props.itemName}: {'  '}
                <input 
                    key={props.propName}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5" 
                    onChange={(e) => {setPending(true); setValue(e.target.value)}}
                    value={currentValue} 
                    onBlur={(e) => update(e.target.value)} 
                    onKeyDown={updateIfEnterPressed}/>
            </label>
        </>
    )
}