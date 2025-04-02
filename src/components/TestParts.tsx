import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table, yBuffer } from '../models/Table';

interface TestPartsProps extends SVGProps {
    table: Table,
}

export default class TestParts extends SVGComponent<TestPartsProps> {
    svg() {
        const length = this.props.table.yCut + yBuffer(this.props.table);
        const sparInset = this.props.table.overhang + (yBuffer(this.props.table) / 2);
        const thickness = this.props.table.thickness;
        const material = this.props.table.material;

        let pathstr = `M 0 0`
        pathstr += `L ${material * 3} 0`
        pathstr += `L ${material * 3} ${thickness}`
        pathstr += `L ${material * 2} ${thickness}`
        pathstr += `L ${material * 2} ${thickness / 2}`
        pathstr += `L ${material} ${thickness / 2}`
        pathstr += `L ${material} ${thickness}`
        pathstr += `L 0 ${thickness}`
        pathstr += 'z'

        pathstr += `M ${material * 3.5} 0`
        pathstr += `L ${material * 4.5} 0`
        pathstr += `L ${material * 4.5} ${thickness / 2}`
        pathstr += `L ${material * 5.5} ${thickness / 2}`
        pathstr += `L ${material * 5.5} 0`
        pathstr += `L ${material * 6.5} 0`
        pathstr += `L ${material * 6.5} ${thickness}`
        pathstr += `L ${material * 3.5} ${thickness}`
        pathstr += 'z'

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 