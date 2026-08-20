import { Configuration, Table } from "../models/Table";

const configurationSlugs: Record<Configuration, string> = {
    "LR4": "lr4",
    "none": "plain",
};

// Dimensions can be fractional. Keep them short, and use an underscore for the
// decimal point so the number cannot be mistaken for a file extension.
function dimension(value: number): string {
    return String(Math.round(value * 100) / 100).replace(".", "_");
}

// Local time, to the minute: 20260804-1432.
function timestamp(now: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");

    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}`;

    return `${date}-${time}`;
}

// Names a download after the table it came from, so a folder full of exports
// stays sortable and tells you what each one is:
//   table-lr4-49x97x3in-20260804-1432.svg
export function exportFilename(table: Table, extension: string): string {
    const configuration = configurationSlugs[table.configuration];
    const size = [table.xCut, table.yCut, table.thickness].map(dimension).join("x");

    return `table-${configuration}-${size}${table.units}-${timestamp(new Date())}.${extension}`;
}
