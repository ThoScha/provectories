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
