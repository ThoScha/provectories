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

export interface IEvaluationQuestion {
  question: string;
  answerPossibilities: { [key: number]: string | number };
  questionId: number;
  taskId: number;
  correctAnswerId: number;
}

export interface ICurrentQuestion extends IEvaluationQuestion {
  answerId: number;
  mentalEffort: number;
}

export type IProvenanceQuestion = Pick<ICurrentQuestion, "questionId" | "taskId" | "answerId" | "correctAnswerId" | "mentalEffort"> & {
  provenance: Provenance<IAppState, string, void>
  endtime: number;
}