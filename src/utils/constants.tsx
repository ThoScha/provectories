export interface IEvaluationQuestion {
	questionId: number;
	taskId: number;
	question: string;
	answerPossibilites: { [key: number]: string | number };
	correctAnswer: number;
}

export const randomEvaluationQuestions: IEvaluationQuestion[] = [
	{
		questionId: 1,
		taskId: 1,
		question: 'In which month of 2014 were the most Group A employees hired in the Northwest region?',
		answerPossibilites: { 1: 'October', 2: 'July', 3: 'September', 4: 'December' },
		correctAnswer: 2
	},
	{
		questionId: 2,
		taskId: 1,
		question: 'How many part-time employees did region East hire in 2014?',
		answerPossibilites: { 1: '1021', 2: '905', 3: '1749', 4: '313' },
		correctAnswer: 1
	},
	{
		questionId: 3,
		taskId: 2,
		question: 'Have there been more new hires of Group F in 2012 or in 2013?',
		answerPossibilites: { 1: 2012, 2: 2013 },
		correctAnswer: 2
	},
	{
		questionId: 4,
		taskId: 2,
		question: 'In which month, in either 2012 or 2014, were most employees hired in the Northwest? Answer with month and year.',
		answerPossibilites: { 1: 'Oct 2014', 2: 'Nov 2012', 3: 'Jul 2014', 4: 'Jun 2014' },
		correctAnswer: 3
	},
	{
		questionId: 5,
		taskId: 3,
		question: 'How many new Group B hires in the East region happened in the range from January to June in 2012?',
		answerPossibilites: { 1: 22, 2: 69, 3: 18, 4: 6 },
		correctAnswer: 1
	},
	{
		questionId: 6,
		taskId: 3,
		question: 'We want to know the new hires of the region South from all ethnicities except Group A in 2013.',
		answerPossibilites: { 1: 768, 2: 422, 3: 802, 4: 565 },
		correctAnswer: 1
	}
];

const lastEvaluationQuestions: IEvaluationQuestion[] = [
	{
		questionId: 7,
		taskId: 4,
		question: 'Find out the month with the most part-time hires over all years? Answer with month and year.',
		answerPossibilites: { 1: 'Oct 2013', 2: 'Jun 2014', 3: 'Nov 2012', 4: 'Sept 2014' },
		correctAnswer: 4
	},
	{
		questionId: 8,
		taskId: 4,
		question: 'Comparing 2011 and 2012: What region had at least one month in which the new hires were lower in 2012 than in 2011.',
		answerPossibilites: { 1: 'West', 2: 'South', 3: 'Northwest', 4: 'East' },
		correctAnswer: 2
	}
]

export const EVALUATION_QUESTIONS: IEvaluationQuestion[] = [...randomEvaluationQuestions.sort((a, b) => 0.5 - Math.random()), ...lastEvaluationQuestions];
