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
    units: Units;
    configuration: Configuration;

    constructor(xCut: number, yCut: number, xSparMinGap: number, ySparMinGap: number, clipMinGap: number, thickness: number, railMaterialThickness: number, material: number, overhang: number, trackCutPoint: number, units: Units, configuration: Configuration) {
        this.xCut = xCut;
        this.yCut = yCut,
        this.xSparMinGap = xSparMinGap;
        this.ySparMinGap = ySparMinGap;
        this.clipMinGap = clipMinGap;
        this.thickness = thickness;
        this.railMaterialThickness = railMaterialThickness;
        this.overhang = overhang;
        this.material = material;
        this.trackCutPoint = trackCutPoint;
        this.units = units;
        this.configuration = configuration;
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
            "mm": [15, 15, 8.25, 24.25],
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
        }[this.units] ;
    }

    get railTrackWidth(): number {
        return {
            "mm": 75,
            "cm": 7.5,
            "in": 75 / 25.4, 
        }[this.units] ;
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
            "in",
            this.configuration,
        )
    }
}