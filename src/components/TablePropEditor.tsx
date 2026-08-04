import { Table, TableEditable } from "../models/Table"
import { useState } from "react";

type TablePropEditorProps = {
    table: Table,
    itemName: string,
    propName: keyof TableEditable,
    updateTable: (c: Table) => void,
    // Optional note shown under the field, for behaviour the label cannot carry.
    hint?: string,
}

export default function TablePropEditor(props: TablePropEditorProps) {
    const [value, setValue] = useState(props.table[props.propName].toString());
    const [pending, setPending] = useState(false);

    const update = (valueStr: string) => {
        const newTable = new Table(
            props.table.xCut,
            props.table.yCut,
            props.table.xSparMinGap,
            props.table.ySparMinGap,
            props.table.clipMinGap,
            props.table.thickness,
            props.table.railMaterialThickness,
            props.table.material,
            props.table.overhang,
            props.table.trackCutPoint,
            props.table.flatOutsideBuffer,
            props.table.flatInsideBuffer,
            props.table.railOutsideBuffer,
            props.table.railInsideBuffer,
            props.table.bitDiameter,
            props.table.units,
            props.table.configuration,
        );
        const val = parseFloat(valueStr);
        setPending(false);
        newTable[props.propName] = val;
        props.updateTable(newTable)
    }

    const updateIfEnterPressed = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (e.key == 'Enter') {
            update(target.value)
        }
    }

    const currentValue = pending ? value : props.table[props.propName];

    return (
        <div className="mb-2">
            <label className="block text-sm font-medium text-gray-900">
                {props.itemName}: {'  '}
                <input
                    key={props.propName}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                    onChange={(e) => {setPending(true); setValue(e.target.value)}}
                    value={currentValue}
                    onBlur={(e) => update(e.target.value)}
                    onKeyDown={updateIfEnterPressed}/>
            </label>
            {props.hint && <p className="mt-1 text-xs text-gray-500">{props.hint}</p>}
        </div>
    )
}