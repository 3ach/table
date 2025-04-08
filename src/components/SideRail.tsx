import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';

interface SideRailProps extends SVGProps {
    table: Table,
}

export default class SideRail extends SVGComponent<SideRailProps> {
    svg() {
        const length = this.props.table.yCut + this.props.table.yBuffer;
        const sparInset = this.props.table.overhang + (this.props.table.yBuffer / 2);
        const thickness = this.props.table.thickness;

        let pathstr = `M 0 0`
        pathstr += `L ${length} 0`
        pathstr += `L ${length} ${thickness}`
        pathstr += `L 0 ${thickness}`
        pathstr += 'z'

        pathstr += `M ${sparInset} ${thickness * 0.25}`;
        pathstr += `L ${sparInset} ${thickness * 0.75}`;

        pathstr += `M ${length - sparInset} ${thickness * 0.25}`;
        pathstr += `L ${length - sparInset} ${thickness * 0.75}`;

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 