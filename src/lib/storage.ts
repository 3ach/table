import { Table, defaultTable, parseTableSnapshot } from "../models/Table";

// Bump the suffix if TableSnapshot ever changes shape incompatibly; an
// unreadable value is discarded in favour of the defaults rather than throwing.
const STORAGE_KEY = "table.parameters.v1";

// Reads the last-used parameters back out of the browser. Falls back to the
// stock table if nothing is stored, storage is unavailable (private browsing,
// blocked cookies) or the stored value no longer parses.
export function loadTable(): Table {
    let stored: string | null = null;

    try {
        stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
        console.warn("Could not read saved table parameters", e);
        return defaultTable();
    }

    if (stored === null) {
        return defaultTable();
    }

    let snapshot = null;
    try {
        snapshot = parseTableSnapshot(JSON.parse(stored));
    } catch (e) {
        console.warn("Saved table parameters were not valid JSON", e);
        return defaultTable();
    }

    if (snapshot === null) {
        console.warn("Saved table parameters were not a valid table, ignoring them");
        return defaultTable();
    }

    return Table.fromSnapshot(snapshot);
}

// Persists the current parameters. Failing to save is not worth interrupting
// the user over, so it is only logged.
export function saveTable(table: Table) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(table.snapshot));
    } catch (e) {
        console.warn("Could not save table parameters", e);
    }
}
