export interface IClusteredBarChartState {
  Region: string[];
  Ethnicity: string[];
  NewHires: number[];
  // selected: boolean;
}

export const defaultClusterBarChart: IClusteredBarChartState = {
  Region: [],
  Ethnicity: [],
  NewHires: []
};

export interface IClusteredColumnChartState {
  Month: string[];
  NewHiresSPLY: number[];
  NewHires: number[];
  // selected: boolean;
}

export const defaultClusteredColumnChart: IClusteredColumnChartState = {
  Month: [],
  NewHiresSPLY: [],
  NewHires: []
};

export interface ILineChartState {
  Month: string[];
  FPDesc: string[];
  NewHires: number[];
  // selected: boolean;
}

export const defaultLineChart: ILineChartState = {
  Month: [],
  FPDesc: [],
  NewHires: []
};

export interface IVisualsState {
  clusteredBarChart: IClusteredBarChartState;
  clusteredColumnChart: IClusteredColumnChartState;
  lineChart: ILineChartState;
}

export interface IParametersState {
  Month: string;
  FPDesc: string;
  Region: string;
  Ethnicity: string;
}

export interface ISlicersState {
  Ethnicity: string;
  Region: string;
}

export interface IFeatureVector {
  time: number;
  visuals: IVisualsState;
  parameters: IParametersState;
  slicers: ISlicersState;
}

export interface IApplicationState {
  featureVector: IFeatureVector;
  bookmark: string;
}
