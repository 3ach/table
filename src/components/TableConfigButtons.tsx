import { useRef } from "react";
import { Table, parseTableSnapshot } from "../models/Table";
import { downloadBlob } from "../lib/download";
import { exportFilename } from "../lib/filename";
import { smallButtonClasses } from "../lib/styles";

type TableConfigButtonsProps = {
    table: Table,
    updateTable: (c: Table) => void,
}

// Export/import of the parameter set as JSON, so a design can be kept in a file
// or handed to someone else. Parameters are also saved in the browser on every
// change (see lib/storage.ts) - this is for moving them between browsers.
export default function TableConfigButtons(props: TableConfigButtonsProps) {
    const fileInput = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const json = JSON.stringify(props.table.snapshot, null, 2);
        downloadBlob(new Blob([json], { type: "application/json" }), exportFilename(props.table, "json"));
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // Clear the input so picking the same file twice in a row still fires.
        e.target.value = '';

        if (!file) {
            return;
        }

        let snapshot = null;
        try {
            snapshot = parseTableSnapshot(JSON.parse(await file.text()));
        } catch {
            alert(`${file.name} is not valid JSON.`);
            return;
        }

        if (snapshot === null) {
            alert(`${file.name} is not a table configuration. Export one to see the expected format.`);
            return;
        }

        props.updateTable(Table.fromSnapshot(snapshot));
    };

    return (
        <div className="mt-2 flex gap-2">
            <button
                className={`${smallButtonClasses} bg-slate-500 hover:bg-slate-600 focus:ring-slate-300`}
                onClick={handleExport}>
                Export JSON
            </button>
            {/* Amber, not slate: importing replaces the table you have open. */}
            <button
                className={`${smallButtonClasses} bg-amber-500 hover:bg-amber-600 focus:ring-amber-300`}
                onClick={() => fileInput.current?.click()}>
                Import JSON
            </button>
            <input
                ref={fileInput}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImport}
            />
        </div>
    );
}
