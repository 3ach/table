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
        case "railMaterialThickness": return "Rail material thickness";
        case "material": return "Material thickness";
        case "overhang": return "Tabletop overhang";
        case "clipMinGap": return "Minimum Rail Clip Gap";
        case "trackCutPoint": return "Rail Max Length per Piece"
        case "flatInsideBuffer": return "Flat rail inside buffer"
        case "flatOutsideBuffer": return "Flat rail outside buffer"
        case "railInsideBuffer": return "Tube rail inside buffer"
        case "railOutsideBuffer": return "Tube rail outside buffer"
        case "bitDiameter": return "CNC bit diameter"
    }
}

type SettingsGroup = {
    title: string,
    description: string,
    fields: (keyof TableEditable)[],
    // Groups that only affect the Lowrider 4 rails are hidden for a plain table.
    lr4Only?: boolean,
}

// Notes shown under individual fields, for behaviour a label cannot carry.
const fieldHints: Partial<Record<keyof TableEditable, string>> = {
    bitDiameter: "Set to 0 to switch off automatic dog-bones and leave inside corners square.",
};

const settingsGroups: SettingsGroup[] = [
    {
        title: "Material",
        description: "The sheet you are cutting and the tool cutting it. Slots are cut as wide as the material, and the bit diameter sizes the dog-bone reliefs in the inside corners.",
        fields: ["material", "bitDiameter"],
    },
    {
        title: "Table size",
        description: "The finished tabletop. The spar frame underneath is inset from these dimensions by the overhang on every side, and the thickness sets how deep the spars are.",
        fields: ["xCut", "yCut", "thickness", "overhang"],
    },
    {
        title: "Spars",
        description: "The egg-crate frame. Spars are never spaced further apart than these gaps; the spacing that comes out is divided evenly across the table, so it is usually tighter.",
        fields: ["xSparMinGap", "ySparMinGap"],
    },
    {
        title: "Rails",
        description: "Rail stock, the longest piece your machine can cut in one go before a rail is split in two, and the spacing of the clips that hold the rails down.",
        fields: ["railMaterialThickness", "trackCutPoint", "clipMinGap"],
        lr4Only: true,
    },
    {
        title: "Track fit",
        description: "Padding added to the flat and tube track cut-outs. Increase these if the machine binds on the rails, decrease them if it has play.",
        fields: ["flatInsideBuffer", "flatOutsideBuffer", "railInsideBuffer", "railOutsideBuffer"],
        lr4Only: true,
    },
];

function updateUnits(table: Table, target: Units): Table {
    return {
        "mm": table.inMillimeters,
        "cm": table.inCentimeters,
        "in": table.inInches,
    }[target];
}

const selectClasses = "block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg p-1.5 focus:ring-blue-500 focus:border-blue-500";

export default function TableEditor(props: TableEditorProps) {
    const updateConfiguration = (configuration: Configuration) => {
        let overhang = 0;
        if (configuration == 'LR4') {
            overhang = {
                'mm':  25,
                'cm': 2.5,
                'in': 1,
            }[props.table.units];
        }

        // A fresh Table, not a mutation of the current one: React bails out of
        // re-rendering if it is handed back the same object.
        props.updateTable(Table.fromSnapshot({
            ...props.table.snapshot,
            overhang,
            configuration,
        }))
    };

    const groups = settingsGroups.filter(
        (group) => !group.lr4Only || props.table.configuration == "LR4"
    );

    return (
        <div className="flex flex-col gap-6">
            <section>
                <h2 className="text-sm font-semibold text-gray-900">Machine</h2>
                <p className="mt-0.5 mb-2 text-xs text-gray-500">
                    What you are building for, and the units every dimension below is
                    given in. Switching units converts the values you have already
                    entered, rounding to something cuttable.
                </p>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                    Configuration: {'  '}
                    <select
                        className={selectClasses}
                        value={props.table.configuration}
                        onChange={(e) => updateConfiguration(e.target.value as Configuration)}
                    >
                        <option value='LR4'>Lowrider 4</option>
                        <option value='none'>No machine (plain table)</option>
                    </select>
                </label>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                    Units: {'  '}
                    <select
                        className={selectClasses}
                        value={props.table.units}
                        onChange={(e) => props.updateTable(updateUnits(props.table, e.target.value as Units))}
                    >
                        <option value='in'>in</option>
                        <option value='mm'>mm</option>
                        <option value='cm'>cm</option>
                    </select>
                </label>
            </section>

            {groups.map((group) => (
                <section key={group.title}>
                    <h2 className="text-sm font-semibold text-gray-900">{group.title}</h2>
                    <p className="mt-0.5 mb-2 text-xs text-gray-500">{group.description}</p>
                    {group.fields.map((field) => (
                        <TablePropEditor
                            key={field}
                            itemName={propertyNameToLabel(field)}
                            propName={field}
                            table={props.table}
                            updateTable={props.updateTable}
                            hint={fieldHints[field]}
                        />
                    ))}
                </section>
            ))}
        </div>
    )
}
