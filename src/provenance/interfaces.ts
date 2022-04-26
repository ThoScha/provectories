export interface IVisState {
  [key: string]: (number | string)[];
}

export interface IVis {
  [key: string]: {
    type: string;
    selected: {
      [key: string]: string | number;
    } | null;
    visState: IVisState;
  };
}

export interface IAppState {
  time: number;
  visuals: IVis;
}

export type IFeatureVector = {
  [key: string]: number | number[] | number[][];
}

export interface IProvectories {
  featureVector?: IFeatureVector;
  appState: IAppState;
  bookmark: string;
}
