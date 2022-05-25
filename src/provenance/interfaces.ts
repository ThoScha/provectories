export interface IVisState {
  [key: string]: number | string[];
}

export interface IAppState {
  [key: string]: {
    type: string;
    selected: {
      [key: string]: string;
    } | null;
    visState: IVisState;
  };
}

export type IFeatureVector = {
  [key: string]: number[];
}

export type IExportFeatureVectorRow = (number | string | number[])[];

export interface IProvectories {
  appState: IAppState;
  bookmark: string;
}
