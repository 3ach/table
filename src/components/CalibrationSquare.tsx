import { SVG } from '@svgdotjs/svg.js';
import { SVGComponent, SVGProps } from './SVGComponent';
import { Table } from '../models/Table';

interface CalibrationSquareProps extends SVGProps {
	table: Table,
}

export default class CalibrationSquare extends SVGComponent<CalibrationSquareProps> {
    svg() {
		const calibrationSquareSize = this.props.table.calibrationSquareSize;

		return SVG().rect(calibrationSquareSize, calibrationSquareSize)
			.fill("none")
			.attr('vector-effect', 'non-scaling-stroke');
    }
} 
