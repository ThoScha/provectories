export interface IVisState {
  [key: string]: (number | string)[];
}

export interface IAppState {
  [key: string]: {
    type: string;
    selected: {
      [key: string]: string | number;
    } | null;
    visState: IVisState;
  };
}

export type IFeatureVector = {
  [key: string]: number[][];
}

export interface IProvectories {
  appState: IAppState;
  bookmark: string;
}
