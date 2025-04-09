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
    trackWidth: number;
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
    trackWidth: number;
    units: Units;
    configuration: Configuration;

    constructor(xCut: number, yCut: number, xSparMinGap: number, ySparMinGap: number, clipMinGap: number, thickness: number, railMaterialThickness: number, material: number, overhang: number, trackWidth: number, units: Units, configuration: Configuration) {
        this.xCut = xCut;
        this.yCut = yCut,
        this.xSparMinGap = xSparMinGap;
        this.ySparMinGap = ySparMinGap;
        this.clipMinGap = clipMinGap;
        this.thickness = thickness;
        this.railMaterialThickness = railMaterialThickness;
        this.overhang = overhang;
        this.material = material;
        this.trackWidth = trackWidth;
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

    get xBuffer(): number {
        if (this.configuration == "LR4") {
            switch (this.units) {
                case 'in': return 11.5;
                case 'mm': return 292;
                case 'cm': return 29.2;
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
            "mm": 4,
            "cm": 0.4,
            "in": 4 / 25.4,
        }[this.units];
    }

    get clipsFrontSetback(): number {
        return {
            "mm": 89,
            "cm": 8.9,
            "in": 3.50, 
        }[this.units];
    }

    get clipsBackSetback(): number {
        return {
            "mm": 50,
            "cm": 5,
            "in": 1.9685, 
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
            "mm": 88,
            "cm": 8.8,
            "in": 88 / 25.4, 
        }[this.units] ;
    }

    get xSparRailShrink(): number {
        return {
            "LR4": 2 * this.railMaterialThickness,
            "none": 0,
        }[this.configuration]
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
            convert(this.trackWidth),
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
            convert(this.trackWidth),
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
            convert(this.trackWidth),
            "in",
            this.configuration,
        )
    }
}