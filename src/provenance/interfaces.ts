
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

export type IFeatureVector = [string[], [number[] | number]];

export interface IAppState {
  time: number;
  visuals: IVis;
}

export interface IProvectories {
  featureVector?: IFeatureVector;
  appState: IAppState;
  bookmark: string;
}
