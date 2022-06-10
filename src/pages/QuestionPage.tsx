import { Report } from 'powerbi-client';
import * as React from 'react';
import { IEvaluationQuestion } from '../constants';
import { ProvectoriesDashboard } from '../ProvectoriesDashboard';
import { ICurrentQuestion } from '../provenance/interfaces';
import { PageRadioButton } from './PageRadioButton';

export function QuestionPage({
	evaluationQuestion,
	reportRef,
	embedUrl,
	error,
	accessTokenRef,
	currentQuestionRef,
	setShowNextButton
}: {
	evaluationQuestion: IEvaluationQuestion;
	reportRef: React.MutableRefObject<Report | undefined>;
	embedUrl: string;
	error: string[];
	accessTokenRef: React.MutableRefObject<string>;
	currentQuestionRef: React.MutableRefObject<ICurrentQuestion | null>;
	setShowNextButton: (showNextButton: boolean) => void;
}) {
	const [selectedAnswer, setSelectedAnswer] = React.useState<number>(-1);
	const [selectedMentalEffort, setSelectedMentalEffort] = React.useState<number>(-1);
	const [reportLoaded, setReportLoaded] = React.useState<boolean>(false);

	React.useEffect(() => {
		setReportLoaded(false)
		setSelectedAnswer(-1);
		setSelectedMentalEffort(-1);
		reportRef.current?.on("loaded", () => {
			setReportLoaded(true);
			reportRef.current?.off("loaded");
		})
	}, [evaluationQuestion.questionId, reportRef]);

	React.useEffect(() => {
		currentQuestionRef.current = {
			correctAnswerId: evaluationQuestion.correctAnswer,
			questionId: evaluationQuestion.questionId,
			taskId: evaluationQuestion.taskId,
			answerId: selectedAnswer,
			mentalEffort: selectedMentalEffort
		}
	}, [evaluationQuestion, selectedAnswer, selectedMentalEffort, currentQuestionRef]);

	return <div className="ms-2">
		<div className="my-3">
			<ProvectoriesDashboard
				reportRef={reportRef}
				accessTokenRef={accessTokenRef}
				embedUrl={embedUrl}
				error={error}
				questionId={evaluationQuestion.questionId}
			/>
		</div>
		<div>
			<div className="row">
				<div className="col-6">
					<p>Frage {evaluationQuestion.questionId}: {evaluationQuestion.question}</p>
				</div>
				<div className="col-6">
					<div className="btn-group w-100" role="group" aria-label="evaluation-answer-radio-button-group">
						{reportLoaded ? Object.keys(evaluationQuestion.answerPossibilites)
							.map((key) => <PageRadioButton<number>
								key={`evaluation-answer-${evaluationQuestion.questionId}-${key}`}
								radioButtonId={Number(key)}
								title={evaluationQuestion.answerPossibilites[key]}
								selected={selectedAnswer}
								setSelected={setSelectedAnswer}
							/>)
							: null}
					</div>
				</div>
			</div>
			{selectedAnswer !== -1 ? <div className="mt-3 row">
				<div className="col-6">
					<p>How high would you rate the amount of mental effort invested for completing this task?</p>
				</div>
				<div className="col-6">
					<div className="btn-group w-100" role="group" aria-label="mental-effort-radio-button-group">
						{[1, 2, 3, 4, 5, 6]
							.map((num) => <PageRadioButton<number>
								key={`mental-effort-radio-button-${num}`}
								radioButtonId={num}
								title={num.toString()}
								selected={selectedMentalEffort}
								setSelected={(selected: number) => {
									setSelectedMentalEffort(selected);
									setShowNextButton(true);
								}}
							/>)
						}
					</div>
					<div className="d-flex justify-content-between text-muted">
						<i>1 - very low mental effort</i><i>6 - very high mental efford</i>
					</div>
				</div>
			</div> : null}
		</div>
	</div >
}
