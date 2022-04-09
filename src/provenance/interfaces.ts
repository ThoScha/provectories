export interface IVisState {
  slicer: boolean;
  selected: {
    [key: string]: string | number;
  } | null;
}

export interface IVisDesc {
  [key: string]: (number | string)[];
}

export interface IVis {
  [key: string]: {
    visState: IVisState;
    visDesc: IVisDesc;
  };
}

export interface IFeatureVector {
  time: number;
  visuals: IVis;
}

export interface IApplicationState {
  featureVector: IFeatureVector;
  bookmark: string;
}



