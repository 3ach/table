import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';

interface XSparProps extends SVGProps {
    table: Table,
}

export default class XSpar extends SVGComponent<XSparProps> {
    svg() {
        const xBuffer = this.props.table.xBuffer;
        const xShrink = this.props.table.xSparRailShrink;
        const xCut = this.props.table.xCut + xBuffer - xShrink;
        const thickness = this.props.table.thickness;
        const material = this.props.table.material;
        const yMortises = this.props.table.ySparCount;
        const overhang = this.props.table.overhang;
        const yGap = this.props.table.ySparGap;


        let pathstr = '';
        const start = (xBuffer / 2) + overhang - (xShrink / 2);
        if (start == 0) {
            pathstr += `M 0 ${thickness / 2}`;
        } else {
            pathstr += `M 0 0`;
        }

        for (let mortise = 0; mortise < yMortises; mortise++) {
            let x = (mortise * yGap) + start;
            if (x != 0) {
                pathstr += `L ${x} 0`; 
            }
            pathstr += `L ${x} ${thickness / 2}`; 
            pathstr += `L ${x + material} ${thickness / 2}`; 

            if (x + material != xCut) {
                pathstr += `L ${x + material} 0`; 
            }
        }

        if (start != 0)  {
            pathstr += `L ${xCut} 0`
        }

        pathstr += `L ${xCut} ${thickness}`
        pathstr += `L 0 ${thickness}`
        pathstr += 'z'

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 