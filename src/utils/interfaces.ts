import { Provenance } from "@visdesignlab/trrack";

export interface IVisState {
  [key: string]: number[] | string[];
}

export interface IAppState {
  [key: string]: {
    type: string;
    selected: {
      [key: string]: string[];
    } | null;
    visState: IVisState;
  };
}

export type IFeatureVector = {
  [key: string]: string | number[];
}

export type IExportFeatureVectorRow = (number | string | number[])[];

export interface IProvectories {
  appState: IAppState;
  bookmark: string;
}

export interface ICurrentQuestion {
  answerId: number;
  mentalEffort: number;
  correctAnswerId: number;
  taskId: number;
  questionId: number;
}

export interface IQuestionProvenance extends ICurrentQuestion {
  provenance: Provenance<IProvectories, string, void>
  endtime: number;
}