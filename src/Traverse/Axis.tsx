class Axis {
  public xRange: string;
  public xAxisControl: string; // NA
  public xLabel: string;
  public xField: string;
  public yRange: string[];
  public yAxisControl: string[]; // NA
  public yLabel: string[];
  public yField: string[];

  constructor() {
    this.xRange = "";
    this.xAxisControl = "";
    this.xLabel = "";
    this.xField = "";
    this.yRange = [];
    this.yAxisControl = [];
    this.yLabel = [];
    this.yField = [];
  }
}

export default Axis;