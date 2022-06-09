import * as React from 'react';
import { IEvaluationQuestion } from '../constants';
import { PageRadioButton } from './PageRadioButton';

export function QuestionPage({
	evaluationQuestion,
	setShowNextButton,
	children
}: {
	evaluationQuestion: IEvaluationQuestion;
	setShowNextButton: (showNextButton: boolean) => void;
	children: React.ReactChild;
}) {
	const [selectedAnswer, setSelectedAnswer] = React.useState<number>(-1);
	const [selectedMentalEffort, setSelectedMentalEffort] = React.useState<number>(-1);

	React.useEffect(() => {
		setSelectedAnswer(-1);
		setSelectedMentalEffort(-1);
	}, [evaluationQuestion.questionId]);

	return <div className="ms-2">
		<div className="my-3">
			{children}
		</div>
		<div>
			<div className="row">
				<div className="col-6">
					<p>Frage {evaluationQuestion.questionId}: {evaluationQuestion.question}</p>
				</div>
				<div className="col-6">
					<div className="btn-group w-100" role="group" aria-label="Basic radio toggle button group">
						{evaluationQuestion.answerPossibilites
							.map((title, i) => <PageRadioButton<number> radioButtonId={i} title={title} selected={selectedAnswer} setSelected={setSelectedAnswer} />)
						}
					</div>
				</div>
			</div>
			{selectedAnswer !== -1 ? <div className="mt-3 row">
				<div className="col-6">
					<p>How high would you rate the amount of mental effort invested for completing this task?</p>
				</div>
				<div className="col-6">
					<div className="btn-group w-100" role="group" aria-label="Basic radio toggle button group">
						{[1, 2, 3, 4, 5, 6]
							.map((num) => <PageRadioButton<number> radioButtonId={num} title={num.toString()} selected={selectedMentalEffort} setSelected={(selected: number) => {
								setSelectedMentalEffort(selected);
								setShowNextButton(true);
							}} />)
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
