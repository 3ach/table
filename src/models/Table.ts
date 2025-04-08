export type Units = "mm" | "in" | "cm";
export type Configuration = "LR4" | "none";

export interface TableEditable {
    xCut: number;
    yCut: number;
    xSparMinGap: number;
    ySparMinGap: number;
    thickness: number;
    overhang: number;
    material: number;
    trackWidth: number;
}

export class Table implements TableEditable {
    xCut: number;
    yCut: number;
    xSparMinGap: number;
    ySparMinGap: number;
    thickness: number;
    overhang: number;
    material: number;
    trackWidth: number;
    units: Units;
    configuration: Configuration;

    constructor(xCut: number, yCut: number, xSparMinGap: number, ySparMinGap: number, thickness: number, overhang: number, material: number, trackWidth: number, units: Units, configuration: Configuration) {
        this.xCut = xCut;
        this.yCut = yCut,
            this.xSparMinGap = xSparMinGap;
        this.ySparMinGap = ySparMinGap;
        this.thickness = thickness;
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
            convert(this.thickness),
            convert(this.overhang),
            convert(this.material),
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
            convert(this.thickness),
            convert(this.overhang),
            convert(this.material),
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
            convert(this.thickness),
            convert(this.overhang),
            convert(this.material),
            convert(this.trackWidth),
            "in",
            this.configuration,
        )
    }
}