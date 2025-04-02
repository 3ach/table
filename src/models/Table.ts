export type Units = "mm" | "in" | "cm";
export type Configuration = "LR4" | "none";

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
    configuration: Configuration,
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
    if (table.configuration == "LR4") {
        switch (table.units) {
            case 'in': return 11.5;
            case 'mm': return 292;
            case 'cm': return 29.2;
        }
    }
    
    return 0;
}

export function yBuffer(table: Table): number {
    if (table.configuration == "LR4") {
        switch (table.units) {
            case 'in': return 12.375;
            case 'mm': return 313;
            case 'cm': return 3.13;
        }
    }

    return 0;
}