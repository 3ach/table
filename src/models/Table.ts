export type Units = "mm" | "in";

export type Table = {
    xCut: number,
    yCut: number,
    xSparGap: number,
    ySparGap: number,
    thickness: number,
    overhang: number,
    material: number,
    trackWidth: number, 
    units: Units,
}

export function ySparCount(table: Table): number {
    const widthToDivide = table.xCut - (2 * table.overhang);
    return Math.ceil((widthToDivide - table.material) / table.ySparGap) + 1;
}

export function ySparGap(table: Table): number {
    const widthToDivide = table.xCut - (2 * table.overhang);
    return (widthToDivide - table.material) / (ySparCount(table) - 1)
}

export function xSparCount(table: Table): number {
    const widthToDivide = table.yCut - (2 * table.overhang);
    return Math.ceil((widthToDivide - table.material) / table.xSparGap) + 1;
}

export function xSparGap(table: Table): number {
    const widthToDivide = table.yCut - (2 * table.overhang);
    return (widthToDivide - table.material) / (xSparCount(table) - 1);
}

export function xBuffer(table: Table): number {
    if (table.units == 'in') {
        return 11.5;
    }

    return 292;
}

export function yBuffer(table: Table): number {
    if (table.units == 'in') {
        return 12.375;
    }

    return 313;
}