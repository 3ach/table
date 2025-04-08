import { Configuration, Table, TableEditable, Units } from "../models/Table"
import TablePropEditor from "./TablePropEditor"

type TableEditorProps = {
    table: Table,
    updateTable: (c: Table) => void,
}

function propertyNameToLabel(name: keyof TableEditable): string {
    switch (name) {
        case "xCut": return "X Cut Dimension";
        case "yCut": return "Y Cut Dimension";
        case "xSparMinGap": return "Minimum X Spar Gap";
        case "ySparMinGap": return "Minimum Y Spar Gap";
        case "thickness": return "Table thickness";
        case "material": return "Material thickness";
        case "overhang": return "Tabletop overhang";
        case "trackWidth": return "Track Width";
    }
}

function updateUnits(table: Table, target: Units): Table {
    return {
        "mm": table.inMillimeters, 
        "cm": table.inCentimeters,
        "in": table.inInches,
    }[target];
}

export default function TableEditor(props: TableEditorProps) {
    let updateConfiguration = (configuration: Configuration) => {
        let overhang = 0;
        if (configuration == 'LR4') {
            overhang = {
                'mm':  25,
                'cm': 2.5,
                'in': 1,
            }[props.table.units];
        }

        props.table.overhang = overhang;
        props.table.configuration = configuration;

        props.updateTable(props.table)
    };


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
                itemName={propertyNameToLabel("xSparMinGap")}
                propName="xSparMinGap"
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
                itemName={propertyNameToLabel("ySparMinGap")}
                propName="ySparMinGap"
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
            <TablePropEditor
                itemName={propertyNameToLabel("overhang")}
                propName="overhang"
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
                    <option value='mm'>mm</option>
                    <option value='cm'>cm</option>
                </select>
            </label>
            <label className="block mb-2 text-sm font-medium text-gray-900">
                Configuration {'  '}
                <select
                    className="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none  focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                    defaultValue={props.table.units} 
                    onChange={(e) => updateConfiguration(e.target.value as Configuration)}
                >
                    <option value='LR4'>Lowrider 4</option>
                    <option value='none'>No machine (plain table)</option>
                </select>
            </label>
        </div>
        </>
    )
}