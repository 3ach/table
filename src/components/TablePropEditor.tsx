import { Table } from "../models/Table"
import { useState } from "react";

type TablePropEditorProps = {
    table: Table,
    itemName: string,
    propName: keyof Table,
    updateTable: (c: Table) => void,
}

export default function TablePropEditor(props: TablePropEditorProps) {
    let [value, setValue] = useState(props.table[props.propName].toString());
    console.log(`Rerendering. ${value}`)

    const update = (valueStr: string) => {
        const val = parseFloat(valueStr);
        props.updateTable({...props.table, [props.propName]: val})
    }

    const updateIfEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (e.key == 'Enter') {
            update(target.value)
        }
    }


    return (
        <>
            <label className="block mb-2 text-sm font-medium text-gray-900">
                {props.itemName}: {'  '}
                <input 
                    key={props.propName}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5" 
                    onChange={(e) => setValue(e.target.value)}
                    value={value} 
                    onBlur={(e) => update(e.target.value)} 
                    onKeyDown={updateIfEnterPressed}/>
            </label>
        </>
    )
}