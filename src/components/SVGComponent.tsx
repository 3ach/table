import SVG from "@svgdotjs/svg.js";
import React from "react";
import parse from "html-react-parser";

export interface SVGProps {
    x: number,
    y: number,
    rotation: number,
    strokeWidth: number,
}

export abstract class SVGComponent<TProps extends SVGProps> extends React.Component<TProps> {

    abstract svg(): SVG.Path;

    render() {
        const group = this.svg()
            .translate(this.props.x, this.props.y)
            .stroke({width: this.props.strokeWidth, color: '#000'})
            .fill('none')
            .rotate(this.props.rotation)

        return parse(group.svg());
    }
}