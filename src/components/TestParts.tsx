import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';
import { dogBoneCorner } from '../lib/dogbone';

interface TestPartsProps extends SVGProps {
    table: Table,
}

export default class TestParts extends SVGComponent<TestPartsProps> {
    svg() {
        const thickness = this.props.table.thickness;
        const material = this.props.table.material;
        const r = this.props.table.dogBoneRadius;
        const depth = thickness / 2;

        let pathstr = `M 0 0`
        pathstr += `L ${material * 3} 0`
        pathstr += `L ${material * 3} ${thickness}`
        pathstr += `L ${material * 2} ${thickness}`
        pathstr += dogBoneCorner(material * 2, depth, 0, -1, -1, 0, r)
        pathstr += dogBoneCorner(material, depth, -1, 0, 0, 1, r)
        pathstr += `L ${material} ${thickness}`
        pathstr += `L 0 ${thickness}`
        pathstr += 'z'

        pathstr += `M ${material * 3.5} 0`
        pathstr += `L ${material * 4.5} 0`
        pathstr += dogBoneCorner(material * 4.5, depth, 0, 1, 1, 0, r)
        pathstr += dogBoneCorner(material * 5.5, depth, 1, 0, 0, -1, r)
        pathstr += `L ${material * 5.5} 0`
        pathstr += `L ${material * 6.5} 0`
        pathstr += `L ${material * 6.5} ${thickness}`
        pathstr += `L ${material * 3.5} ${thickness}`
        pathstr += 'z'

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 
