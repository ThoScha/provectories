import { IEvaluationQuestion } from "./interfaces";

const randomEvaluationQuestions: IEvaluationQuestion[] = [
	{
		questionId: 1,
		taskId: 1,
		question: 'In which month of 2014 the most Group A employees were hired in the Northwest region?',
		answerPossibilities: { 1: 'October', 2: 'July', 3: 'September', 4: 'December' },
		correctAnswerId: 2
	},
	{
		questionId: 2,
		taskId: 1,
		question: 'How many part-time employees did region East hire in 2014?',
		answerPossibilities: { 1: '1021', 2: '905', 3: '1749', 4: '313' },
		correctAnswerId: 1
	},
	{
		questionId: 3,
		taskId: 2,
		question: 'Were more Group F employees hired in 2012 or in 2013?',
		answerPossibilities: { 1: 2012, 2: 2013 },
		correctAnswerId: 2
	},
	{
		questionId: 4,
		taskId: 2,
		question: 'In which month, in either 2012 or 2014, most employees were hired in the Northwest? Answer with month and year.',
		answerPossibilities: { 1: 'Oct 2014', 2: 'Nov 2012', 3: 'Jul 2014', 4: 'Jun 2014' },
		correctAnswerId: 3
	},
	{
		questionId: 5,
		taskId: 3,
		question: 'How many new Group B hires in the East region happened in the range from January to June in 2012?',
		answerPossibilities: { 1: 22, 2: 69, 3: 18, 4: 6 },
		correctAnswerId: 1
	},
	{
		questionId: 6,
		taskId: 3,
		question: 'How many employees of all ethnicities except Group A did region South hire in 2013?',
		answerPossibilities: { 1: 768, 2: 422, 3: 802, 4: 565 },
		correctAnswerId: 1
	}
];

const lastEvaluationQuestions: IEvaluationQuestion[] = [
	{
		questionId: 7,
		taskId: 4,
		question: 'Across all years, which month had the most part-time hires? Answer with month and year.',
		answerPossibilities: { 1: 'Oct 2013', 2: 'Jun 2014', 3: 'Nov 2012', 4: 'Sept 2014' },
		correctAnswerId: 4
	},
	{
		questionId: 8,
		taskId: 4,
		question: 'Which region had at least one month with a lower number of new hires in 2012 than in 2011?',
		answerPossibilities: { 1: 'West', 2: 'South', 3: 'Northwest', 4: 'East' },
		correctAnswerId: 2
	}
]

export const EVALUATION_QUESTIONS: IEvaluationQuestion[] = [
	...randomEvaluationQuestions.sort((a, b) => 0.5 - Math.random()),
	...lastEvaluationQuestions
];
