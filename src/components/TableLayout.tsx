import { Table } from '../models/Table'
import YSpar from './YSpar';
import XSpar from './XSpar';
import TopRail from './TopRail';
import SideRail from './SideRail';
import TestParts from './TestParts';

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
    const configuration = props.table.configuration;
    const xSparCount = props.table.xSparCount;
    const ySparCount = props.table.ySparCount;
    const yBuffer = props.table.yBuffer;

    let ySpars = [];

    for (let spar = 0; spar < ySparCount; spar++) {
        let y = ((kerfWidth + tableThickness) * spar) + (strokeWidth / 2);
        ySpars.push(
            <YSpar key={`spar-${spar}`} table={props.table} x={strokeWidth / 2} y={y} rotation={0} strokeWidth={strokeWidth}/>
        );
    }

    let xSpars = [];

    for (let spar = 0; spar < xSparCount; spar++) {
        let y = ((kerfWidth + tableThickness) * (spar + ySparCount)) + (strokeWidth / 2);
        xSpars.push(
            <XSpar key={`spar-${spar}`} table={props.table} x={strokeWidth / 2} y={y} rotation={0} strokeWidth={strokeWidth}/>
        );
    }

    const firstRail = ((kerfWidth + tableThickness) * (xSparCount + ySparCount)) + (strokeWidth / 2);
    const width = yCut + strokeWidth + yBuffer;
    const height =  (tableThickness + strokeWidth) * (ySparCount + xSparCount) + (4 * kerfWidth) + (2 * (trackWidth + tableThickness));
    const viewBox = `0 0 ${width} ${height * 1.5}`

    let rails = [];
    if (configuration == "LR4") {
        rails.push(<TopRail key={"rail-top"} table={props.table} x={strokeWidth / 2} y={firstRail} rotation={0} strokeWidth={strokeWidth} rail={true} />);
        rails.push(<TopRail key={"flat-top"} table={props.table} x={strokeWidth / 2} y={firstRail + trackWidth + kerfWidth} rotation={0} strokeWidth={strokeWidth} rail={false} />);
        rails.push(<SideRail key={"rail-side"} table={props.table} x={strokeWidth / 2} y={firstRail + (2 * (trackWidth + kerfWidth))} rotation={0} strokeWidth={strokeWidth} />);
        rails.push(<SideRail key={"flat-side"} table={props.table} x={strokeWidth / 2} y={firstRail + (2 * (trackWidth + kerfWidth)) + tableThickness + kerfWidth} rotation={0} strokeWidth={strokeWidth} />);
    }

    let testPartY = firstRail;
    if (configuration == "LR4") {
        testPartY = firstRail + (2 * (trackWidth + kerfWidth)) + (2 * (tableThickness + kerfWidth));
    }

    return (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" className="max-h-screen max-w-screen w-screen" viewBox={viewBox} preserveAspectRatio="xMinYMin" version="1.1">
                {ySpars}
                {xSpars}
                {rails}
                <TestParts table={props.table} x={strokeWidth / 2} y={testPartY} rotation={0} strokeWidth={strokeWidth} />
            </svg>
        </>
    )
}