import React from "react";
import * as d3 from "d3";

interface TextProps {};

class Text extends React.Component<TextProps, {}> {

    constructor(props: TextProps) {
        super(props);
    }

    render(): JSX.Element {
      return (
          <div id="myRect">
            <form>
              <label>
                Data:
                <input type = "text" name="data" />
              </label>
              </form>          -
          </div>
      );
    }

    async drawSquare():Promise<void>{

        const svg = d3.select("#myRect").append("svg").attr("width", 400).attr("height", 585).append('g');
        svg.append("g")
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 50)
            .attr('height', 50)
            .attr('stroke', 'black')
            .attr('fill', '#69a3b2');

    }
}

export default Text;