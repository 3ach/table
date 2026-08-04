export type Units = "mm" | "in" | "cm";
export type Configuration = "LR4" | "none";

export interface TableEditable {
    xCut: number;
    yCut: number;
    xSparMinGap: number;
    ySparMinGap: number;
    clipMinGap: number;
    thickness: number;
    railMaterialThickness: number;
    overhang: number;
    material: number;
    trackCutPoint: number;
    flatOutsideBuffer: number;
    flatInsideBuffer: number;
    railOutsideBuffer: number;
    railInsideBuffer: number;
    bitDiameter: number;
    // Space left between parts nested on the sheet. 0 means work it out from the
    // bit diameter - see Table.effectivePartMargin.
    partMargin: number;
}

// A Table serialized down to plain data: every editable dimension plus the
// units they are expressed in and the machine configuration. This is the shape
// written to localStorage and to exported .json files.
export interface TableSnapshot extends TableEditable {
    units: Units;
    configuration: Configuration;
}

// Every numeric field of TableEditable. Snapshots are read and written by name
// through this list rather than through the positional constructor, so adding a
// dimension only means adding it here (and to propertyNameToLabel).
export const tableNumericFields: (keyof TableEditable)[] = [
    "xCut",
    "yCut",
    "xSparMinGap",
    "ySparMinGap",
    "clipMinGap",
    "thickness",
    "railMaterialThickness",
    "overhang",
    "material",
    "trackCutPoint",
    "flatOutsideBuffer",
    "flatInsideBuffer",
    "railOutsideBuffer",
    "railInsideBuffer",
    "bitDiameter",
    "partMargin",
];

// The stock Lowrider 4 table, in inches.
export function defaultTable(): Table {
    return new Table(
        49,
        97,
        12,
        12,
        11.75,
        3,
        0.75,
        0.75,
        1,
        95,
        0,
        0.5,
        0,
        0.25,
        0.125,
        0,
        "in",
        "LR4",
    );
}

// Validates untrusted data (a parsed .json file, or whatever is in
// localStorage) into a TableSnapshot, or returns null if it is not one. A field
// that is simply absent takes its default, so a table saved or exported by an
// older version still loads when a new dimension is added.
export function parseTableSnapshot(raw: unknown): TableSnapshot | null {
    if (typeof raw !== "object" || raw === null) {
        return null;
    }

    const data = raw as Record<string, unknown>;

    if (data.units !== "mm" && data.units !== "cm" && data.units !== "in") {
        return null;
    }

    if (data.configuration !== "LR4" && data.configuration !== "none") {
        return null;
    }

    const snapshot = {
        units: data.units,
        configuration: data.configuration,
    } as TableSnapshot;

    const defaults = defaultTable();

    for (const field of tableNumericFields) {
        const value = data[field];

        if (value === undefined) {
            snapshot[field] = defaults[field];
            continue;
        }

        if (typeof value !== "number" || !Number.isFinite(value)) {
            return null;
        }

        snapshot[field] = value;
    }

    return snapshot;
}

export class Table implements TableEditable {
    xCut: number;
    yCut: number;
    xSparMinGap: number;
    ySparMinGap: number;
    clipMinGap: number;
    thickness: number;
    railMaterialThickness: number;
    overhang: number;
    material: number;
    trackCutPoint: number;
    flatOutsideBuffer: number;
    flatInsideBuffer: number;
    railOutsideBuffer: number;
    railInsideBuffer: number;
    bitDiameter: number;
    partMargin: number;
    units: Units;
    configuration: Configuration;

    constructor(
        xCut: number, 
        yCut: number, 
        xSparMinGap: number, 
        ySparMinGap: number, 
        clipMinGap: number, 
        thickness: number, 
        railMaterialThickness: number, 
        material: number, 
        overhang: number, 
        trackCutPoint: number, 
        flatOutsideBuffer: number,
        flatInsideBuffer: number,
        railOutsideBuffer: number,
        railInsideBuffer: number,
        bitDiameter: number,
        partMargin: number,
        units: Units,
        configuration: Configuration
    ) {
        this.xCut = xCut;
        this.yCut = yCut;
        this.xSparMinGap = xSparMinGap;
        this.ySparMinGap = ySparMinGap;
        this.clipMinGap = clipMinGap;
        this.thickness = thickness;
        this.railMaterialThickness = railMaterialThickness;
        this.overhang = overhang;
        this.material = material;
        this.trackCutPoint = trackCutPoint;
        this.flatOutsideBuffer = flatOutsideBuffer;
        this.flatInsideBuffer = flatInsideBuffer;
        this.railOutsideBuffer = railOutsideBuffer;
        this.railInsideBuffer = railInsideBuffer;
        this.bitDiameter = bitDiameter;
        this.partMargin = partMargin;
        this.units = units;
        this.configuration = configuration;
    }

    get snapshot(): TableSnapshot {
        const snapshot = {
            units: this.units,
            configuration: this.configuration,
        } as TableSnapshot;

        for (const field of tableNumericFields) {
            snapshot[field] = this[field];
        }

        return snapshot;
    }

    // Rebuilds a Table from plain data by field name, so callers never have to
    // get the constructor's argument order right.
    static fromSnapshot(snapshot: TableSnapshot): Table {
        const table = defaultTable();

        for (const field of tableNumericFields) {
            table[field] = snapshot[field];
        }

        table.units = snapshot.units;
        table.configuration = snapshot.configuration;

        return table;
    }

    get ySparCount(): number {
        const widthToDivide = this.xCut - (2 * this.overhang);
        return Math.ceil((widthToDivide - this.material) / this.ySparMinGap) + 1;
    }

    get ySparGap(): number {
        const widthToDivide = this.xCut - (2 * this.overhang);
        return (widthToDivide - this.material) / (this.ySparCount - 1)
    }

    get xSparGap(): number {
        const widthToDivide = this.yCut - (2 * this.overhang);
        return (widthToDivide - this.material) / (this.xSparCount - 1);
    }

    get xSparCount(): number {
        const widthToDivide = this.yCut - (2 * this.overhang);
        return Math.ceil((widthToDivide - this.material) / this.xSparMinGap) + 1;
    }

    get flatBuffer(): number {
        if (this.configuration == "LR4") {
            switch (this.units) {
                case 'in': return 157 / 25.4;
                case 'mm': return 157;
                case 'cm': return 15.7;
            }
        }

        return 0;
    }

    get railBuffer(): number {
        if (this.configuration == "LR4") {
            switch (this.units) {
                case 'in': return 133 / 25.4;
                case 'mm': return 133;
                case 'cm': return 13.3;
            }
        }

        return 0;
    }

    get yBuffer(): number {
        if (this.configuration == "LR4") {
            switch (this.units) {
                case 'in': return 12.375;
                case 'mm': return 313;
                case 'cm': return 31.3;
            }
        }

        return 0;
    }

    get holeSize(): number {
        return {
            "mm": 4.5,
            "cm": 0.45,
            "in": 4.5 / 25.4,
        }[this.units];
    }

    get frontHoleCoordinates(): [number, number, number] {
        return {
            "mm": [7.75, 8.25, 21.75],
            "cm": [7.75 / 10, 8.25 / 10, 21.75 / 10],
            "in": [7.75 / 25.4, 8.25 / 25.4, 21.75 / 25.4],
        }[this.units] as [number, number, number];
    }

    get backHoleCoordinates(): [number, number, number, number] {
        return {
            "mm": [15, 7.75, 8.25, 24.25],
            "cm": [15 / 10, 7.75 / 10, 8.25 / 10, 24.25 / 10],
            "in": [15 / 25.4, 7.75 / 25.4, 8.25 / 25.4, 24.25 / 25.4],
        }[this.units] as [number, number, number, number];
    }

    get clipsFrontSetback(): number {
        return {
            "mm": (51 + 5 + 10),
            "cm": (51 + 5 + 10) / 10,
            "in": (51 + 5 + 10) / 25.4, 
        }[this.units];
    }

    get clipsBackSetback(): number {
        return {
            "mm": 44 + 5 + 10,
            "cm": (44 + 5 + 10) / 10,
            "in": (44 + 5 + 10) / 25.4, 
        }[this.units] ;
    }

    get totalClipLength(): number {
        const yLength = this.yCut + this.yBuffer;
        return yLength - this.clipsFrontSetback - this.clipsBackSetback;
    }

    get clipCount(): number {
        return Math.ceil(this.totalClipLength / this.clipMinGap) + 1;
    }

    get clipGap(): number {
        return this.totalClipLength / (this.clipCount - 1);
    }

    get clipOffset(): number {
        return {
            "mm": 67.8,
            "cm": 6.78,
            "in": 67.8 / 25.4, 
        }[this.units] ;
    }

    get xSparRailShrink(): number {
        return {
            "LR4": 2 * this.railMaterialThickness,
            "none": 0,
        }[this.configuration]
    }

    get flatTrackWidth(): number {
        return {
            "mm": 40,
            "cm": 4,
            "in": 40 / 25.4, 
        }[this.units] + this.flatInsideBuffer + this.flatOutsideBuffer;
    }

    get railTrackWidth(): number {
        return {
            "mm": 75,
            "cm": 7.5,
            "in": 75 / 25.4, 
        }[this.units] + this.railInsideBuffer + this.railOutsideBuffer;
    }

    get calibrationSquareSize(): number {
        return {
            "mm": 25,
            "cm": 2.5,
            "in": 1, 
        }[this.units];
    }

    get dogBoneRadius(): number {
        return this.bitDiameter / 2;
    }

    // How much clear space to leave between parts nested on the sheet. The
    // partMargin setting wins when it is set; 0 means work it out automatically,
    // as four bit diameters - enough for the cutter to pass between two parts
    // without touching either. With no bit diameter to go on (dog-bones off),
    // fall back to a fixed 20mm.
    get effectivePartMargin(): number {
        if (this.partMargin > 0) {
            return this.partMargin;
        }

        if (this.bitDiameter > 0) {
            return 4 * this.bitDiameter;
        }

        return {
            "mm": 20,
            "cm": 2,
            "in": 20 / 25.4,
        }[this.units];
    }

    get inMillimeters(): Table {
        const convert = {
            "mm": (x: number) => x,
            "cm": (x: number) => x * 10,
            "in": (x: number) => Math.ceil(25.4 * x),
        }[this.units];

        return new Table(
            convert(this.xCut),
            convert(this.yCut),
            convert(this.xSparMinGap),
            convert(this.ySparMinGap),
            convert(this.clipMinGap),
            convert(this.thickness),
            convert(this.railMaterialThickness),
            convert(this.material),
            convert(this.overhang),
            convert(this.trackCutPoint),
            convert(this.flatOutsideBuffer),
            convert(this.flatInsideBuffer),
            convert(this.railOutsideBuffer),
            convert(this.railInsideBuffer),
            convert(this.bitDiameter),
            convert(this.partMargin),
            "mm",
            this.configuration,
        )
    }

    get inCentimeters(): Table {
        const convert = {
            "mm": (x: number) => x / 10,
            "cm": (x: number) => x,
            "in": (x: number) => Math.ceil(25.4 * x) / 10,
        }[this.units];

        return new Table(
            convert(this.xCut),
            convert(this.yCut),
            convert(this.xSparMinGap),
            convert(this.ySparMinGap),
            convert(this.clipMinGap),
            convert(this.thickness),
            convert(this.railMaterialThickness),
            convert(this.material),
            convert(this.overhang),
            convert(this.trackCutPoint),
            convert(this.flatOutsideBuffer),
            convert(this.flatInsideBuffer),
            convert(this.railOutsideBuffer),
            convert(this.railInsideBuffer),
            convert(this.bitDiameter),
            convert(this.partMargin),
            "cm",
            this.configuration,
        )
    }

    get inInches(): Table {
        const convert = {
            "mm": (x: number) => Math.ceil((x * 16) / 25.4) / 16,
            "cm": (x: number) => Math.ceil((x * 16) / 2.54) / 16,
            "in": (x: number) => x,
        }[this.units];

        return new Table(
            convert(this.xCut),
            convert(this.yCut),
            convert(this.xSparMinGap),
            convert(this.ySparMinGap),
            convert(this.clipMinGap),
            convert(this.thickness),
            convert(this.railMaterialThickness),
            convert(this.material),
            convert(this.overhang),
            convert(this.trackCutPoint),
            convert(this.flatOutsideBuffer),
            convert(this.flatInsideBuffer),
            convert(this.railOutsideBuffer),
            convert(this.railInsideBuffer),
            convert(this.bitDiameter),
            convert(this.partMargin),
            "in",
            this.configuration,
        )
    }
}
