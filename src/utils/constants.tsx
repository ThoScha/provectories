import { IEvaluationQuestion } from "./interfaces";

const month = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec'
];

const randomEvaluationQuestions: IEvaluationQuestion[] = [
	{
		questionId: 1,
		taskId: 1,
		question: 'In which month of 2014 were most Group A employees hired in the region Northwest?',
		answerPossibilities: {
			month
		},
		correctAnswer: 'Jul'
	},
	{
		questionId: 2,
		taskId: 1,
		question: 'How many part-time employees were hired in region East in 2014?',
		answerPossibilities: { numeric: [] },
		correctAnswer: '1021'
	},
	{
		questionId: 3,
		taskId: 2,
		question: 'Were more Group F employees hired in 2012 or in 2013?',
		answerPossibilities: {
			year: [
				'2012',
				'2013',
			],
		},
		correctAnswer: '2013'
	},
	{
		questionId: 4,
		taskId: 2,
		question: 'In which month most employees were hired in the Northwest either in 2012 or 2014? Answer with month and year.',
		answerPossibilities: {
			month,
			year: [
				'2012',
				'2014',
			]
		},
		correctAnswer: 'Jul 2014'
	},
	{
		questionId: 5,
		taskId: 3,
		question: 'How many new Group B hires in the East region were in the range from January to June in 2012?',
		answerPossibilities: { numeric: [] },
		correctAnswer: '22'
	},
	{
		questionId: 6,
		taskId: 3,
		question: 'In 2013 how many employees were hired in region South across all ethnicities except Group A?',
		answerPossibilities: { numeric: [] },
		correctAnswer: '768'
	}
];

const lastEvaluationQuestions: IEvaluationQuestion[] = [
	{
		questionId: 7,
		taskId: 4,
		question: 'Comparing each year, in which month were most part-time hires? Answer with month and year.',
		answerPossibilities: {
			month,
			year: [
				'2010',
				'2011',
				'2012',
				'2013',
				'2014',
				'2015',
				'2016'
			]
		},
		correctAnswer: 'Sep 2014'
	},
	{
		questionId: 8,
		taskId: 4,
		question: 'Which region had at least one month with a lower number of new hires in 2012 than in 2011?',
		answerPossibilities: {
			region: [
				'North',
				'Midwest',
				'Northwest',
				'East',
				'Central',
				'South',
				'West'
			]
		},
		correctAnswer: 'South'
	}
]

export const EVALUATION_QUESTIONS: IEvaluationQuestion[] = [
	...randomEvaluationQuestions.sort((a, b) => 0.5 - Math.random()),
	...lastEvaluationQuestions
];
