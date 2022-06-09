import { Dashboard } from "dashboard";
import React from "react";
import { BackgroundQuestionsPage } from "./pages/BackgroundQuestionsPage";
import { FirstPage } from "./pages/DSGVOPage";
import { QuestionPage } from "./pages/QuestionPage";
import { ProvectoriesDashboard } from "./ProvectoriesDashboard";

export interface IEvaluationQuestion {
	questionId: number;
	taskId: number;
	question: string;
	answerPossibilites: string[];
}

export const EVALUATION_QUESTIONS: IEvaluationQuestion[] = [
	{
		questionId: 1,
		taskId: 1,
		question: 'In which month of 2014 were the most Group A employees hired in the Northwest region?',
		answerPossibilites: ['January', 'July', 'August', 'December']
	},
	{
		questionId: 2,
		taskId: 1,
		question: 'How many part-time employees did region East hire in 2014?',
		answerPossibilites: ['1021', '103', '5087', '859']
	}
];

export function getPage(): { [page: number]: React.ReactNode } {
	return {
		0: <FirstPage />,
		1: <BackgroundQuestionsPage />,
		2: <QuestionPage evaluationQuestion={EVALUATION_QUESTIONS[0]}><ProvectoriesDashboard /></QuestionPage>,
		3: <QuestionPage evaluationQuestion={EVALUATION_QUESTIONS[1]}><ProvectoriesDashboard /></QuestionPage>
	};
}

