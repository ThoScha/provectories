
export interface IVisDesc {
  type: string;
  columnToAttributeMap: { [key: string]: string };
  selected: {
    [key: string]: string | number;
  } | null;
}

export interface IVisState {
  [key: string]: {
    [key: string]: (number | string)[];
  };
}

export interface IVis {
  [key: string]: {
    visDesc: IVisDesc;
    visState: IVisState;
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



