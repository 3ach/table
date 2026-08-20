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
        // One piece of each kind: the first slotted up from the bottom edge like
        // a Y spar, the second down from the top like an X spar.
        const downDepth = this.props.table.slotDepth;
        const upDepth = thickness - downDepth;

        let pathstr = `M 0 0`
        pathstr += `L ${material * 3} 0`
        pathstr += `L ${material * 3} ${thickness}`
        pathstr += `L ${material * 2} ${thickness}`
        pathstr += dogBoneCorner(material * 2, upDepth, 0, -1, -1, 0, r)
        pathstr += dogBoneCorner(material, upDepth, -1, 0, 0, 1, r)
        pathstr += `L ${material} ${thickness}`
        pathstr += `L 0 ${thickness}`
        pathstr += 'z'

        pathstr += `M ${material * 3.5} 0`
        pathstr += `L ${material * 4.5} 0`
        pathstr += dogBoneCorner(material * 4.5, downDepth, 0, 1, 1, 0, r)
        pathstr += dogBoneCorner(material * 5.5, downDepth, 1, 0, 0, -1, r)
        pathstr += `L ${material * 5.5} 0`
        pathstr += `L ${material * 6.5} 0`
        pathstr += `L ${material * 6.5} ${thickness}`
        pathstr += `L ${material * 3.5} ${thickness}`
        pathstr += 'z'

        return SVG().path(pathstr).fill("none").attr('vector-effect', 'non-scaling-stroke');
    }
} 
