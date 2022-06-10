export interface IEvaluationQuestion {
	questionId: number;
	taskId: number;
	question: string;
	answerPossibilites: { [key: number]: string | number };
	correctAnswer: number;
}

export const EVALUATION_QUESTIONS: IEvaluationQuestion[] = [
	{
		questionId: 1,
		taskId: 1,
		question: 'In which month of 2014 were the most Group A employees hired in the Northwest region?',
		answerPossibilites: { 1: 'January', 2: 'July', 3: 'August', 4: 'December' },
		correctAnswer: 2
	},
	{
		questionId: 2,
		taskId: 1,
		question: 'How many part-time employees did region East hire in 2014?',
		answerPossibilites: { 1: '1021', 2: '103', 3: '5087', 4: '859' },
		correctAnswer: 1
	}
];
