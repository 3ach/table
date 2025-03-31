import { Table, Units } from "../models/Table"
import TablePropEditor from "./TablePropEditor"

type TableEditorProps = {
    table: Table,
    updateTable: (c: Table) => void,
}

function propertyNameToLabel(name: keyof Table): string {
    switch (name) {
        case "xCut": return "X Cut Dimension";
        case "yCut": return "Y Cut Dimension";
        case "xSparGap": return "Minimum X Spar Gap";
        case "ySparGap": return "Minimum Y Spar Gap";
        case "thickness": return "Table thickness";
        case "material": return "Material thickness";
        case "overhang": return "Tabletop overhang";
        case "units": return "Units";
    }
}

function updateUnits(table: Table, target: Units): Table {
    if (table.units == target) {
        return table;
    }

    if (table.units == 'in') {
        return {
            'xCut': Math.ceil(table.xCut * 25.4),
            'yCut': Math.ceil(table.yCut * 25.4),
            'xSparGap': Math.ceil(table.xSparGap * 25.4),
            'ySparGap': Math.ceil(table.ySparGap * 25.4),
            'thickness': Math.ceil(table.thickness * 25.4),
            'material': Math.ceil(table.material * 25.4),
            'overhang': Math.ceil(table.overhang * 25.4),
            'units': 'mm'
        }
    }

    return {
        'xCut': Math.floor((table.xCut * 16) / 25.4) / 16,
        'yCut': Math.floor((table.yCut * 16) / 25.4) / 16,
        'xSparGap': Math.floor((table.xSparGap * 16) / 25.4) / 16,
        'ySparGap': Math.floor((table.ySparGap * 16) / 25.4) / 16,
        'thickness': Math.floor((table.thickness * 16) / 25.4) / 16,
        'material': Math.floor((table.material * 16) / 25.4) / 16,
        'overhang': Math.floor((table.material * 16) / 25.4) / 16,
        'units': 'in'
    }
}

export default function TableEditor(props: TableEditorProps) {
    return (
        <>
        <div className="inline-block p-1.5">
            <TablePropEditor
                itemName={propertyNameToLabel("xCut")}
                propName="xCut"
                table={props.table}
                updateTable={props.updateTable}
            />
            <TablePropEditor
                itemName={propertyNameToLabel("xSparGap")}
                propName="xSparGap"
                table={props.table}
                updateTable={props.updateTable}
            />
        </div>
        <div className="inline-block p-1.5">
            <TablePropEditor
                itemName={propertyNameToLabel("yCut")}
                propName="yCut"
                table={props.table}
                updateTable={props.updateTable}
            />
            <TablePropEditor
                itemName={propertyNameToLabel("ySparGap")}
                propName="ySparGap"
                table={props.table}
                updateTable={props.updateTable}
            />
        </div>
        <div className="inline-block p-1.5">
            <TablePropEditor
                itemName={propertyNameToLabel("thickness")}
                propName="thickness"
                table={props.table}
                updateTable={props.updateTable}
            />
            <TablePropEditor
                itemName={propertyNameToLabel("material")}
                propName="material"
                table={props.table}
                updateTable={props.updateTable}
            />
        </div>
        <div className="inline-block p-1.5">
            <label className="block mb-2 text-sm font-medium text-gray-900">
                Units: {'  '}
                <select
                    className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none  focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                    defaultValue={props.table.units} 
                    onChange={(e) => props.updateTable(updateUnits(props.table, e.target.value as Units))}
                >
                    <option value='in'>in</option>
                    {/* <option value='mm'>mm</option> */}
                </select>
            </label>
            <TablePropEditor
                itemName={propertyNameToLabel("overhang")}
                propName="overhang"
                table={props.table}
                updateTable={props.updateTable}
            />
        </div>
        </>
    )
}