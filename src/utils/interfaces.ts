import { Provenance } from "@visdesignlab/trrack";
import { pick } from "lodash";

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

interface IQuestion {
  questionId: number;
  taskId: number;
  correctAnswerId: number;
}

export interface IEvaluationQuestion extends IQuestion {
  question: string;
  answerPossibilites: { [key: number]: string | number };
}

export interface ICurrentQuestion extends IQuestion {
  answerId: number;
  mentalEffort: number;
}

export interface IQuestionProvenance extends ICurrentQuestion {
  provenance: Provenance<IProvectories, string, void>
  endtime: number;
}