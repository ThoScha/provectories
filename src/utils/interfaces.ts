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
  answerPossibilities: { [title: string]: string[] };
  questionId: number;
  taskId: number;
  correctAnswer: string;
}

export interface ICurrentQuestion extends IEvaluationQuestion {
  selectedAnswer: string;
  mentalEffort: number;
}

export type IProvenanceQuestion = Pick<ICurrentQuestion, "questionId" | "taskId" | "selectedAnswer" | "correctAnswer" | "mentalEffort"> & {
  provenance: Provenance<IAppState, string, void>
  endtime: number;
}