import { Table, ySparCount, xSparCount, yBuffer } from '../models/Table'
import YSpar from './YSpar';
import XSpar from './XSpar';
import TopRail from './TopRail';
import SideRail from './SideRail';

type TableLayoutProps = {
    table: Table,
    strokeWidth: number,
    scaleToHeight?: number,
}

export default function TableLayout(props: TableLayoutProps) {
    const strokeWidth = props.strokeWidth;
    const tableThickness = props.table.thickness;
    const materialThickness = props.table.material
    const kerfWidth = materialThickness / 2;
    const yCut = props.table.yCut;
    const trackWidth = props.table.trackWidth;
    
    const numYSpars = ySparCount(props.table);
    let ySpars = [];

    for (let spar = 0; spar < numYSpars; spar++) {
        let y = ((kerfWidth + tableThickness) * spar) + (strokeWidth / 2);
        ySpars.push(
            <YSpar key={`spar-${spar}`} table={props.table} x={strokeWidth / 2} y={y} rotation={0} strokeWidth={strokeWidth}/>
        );
    }

    const numXSpars = xSparCount(props.table);
    let xSpars = [];

    for (let spar = 0; spar < numXSpars; spar++) {
        let y = ((kerfWidth + tableThickness) * (spar + numYSpars)) + (strokeWidth / 2);
        xSpars.push(
            <XSpar key={`spar-${spar}`} table={props.table} x={strokeWidth / 2} y={y} rotation={0} strokeWidth={strokeWidth}/>
        );
    }

    const firstRail = ((kerfWidth + tableThickness) * (numXSpars + numYSpars)) + (strokeWidth / 2);
    const width = yCut + strokeWidth + yBuffer(props.table);
    const height =  (tableThickness + strokeWidth) * (numYSpars + numXSpars) + (4 * kerfWidth) + (2 * (trackWidth + tableThickness));
    const viewBox = `0 0 ${width} ${height * 1.5}`

    return (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" className="max-h-screen max-w-screen w-screen" viewBox={viewBox} preserveAspectRatio="xMinYMin" version="1.1">
                {ySpars}
                {xSpars}
                <TopRail table={props.table} x={strokeWidth / 2} y={firstRail} rotation={0} strokeWidth={strokeWidth} />
                <TopRail table={props.table} x={strokeWidth / 2} y={firstRail + trackWidth + kerfWidth} rotation={0} strokeWidth={strokeWidth} />
                <SideRail table={props.table} x={strokeWidth / 2} y={firstRail + (2 * (trackWidth + kerfWidth))} rotation={0} strokeWidth={strokeWidth} />
                <SideRail table={props.table} x={strokeWidth / 2} y={firstRail + (2 * (trackWidth + kerfWidth)) + tableThickness + kerfWidth} rotation={0} strokeWidth={strokeWidth} />
            </svg>
        </>
    )
}