import * as React from 'react';
import { MainContext } from '../App';
import { IEvaluationQuestion } from '../constants';

function QuestionPageRadioButton({ id, title, selected, setSelected }: { id: number, title: string, selected: number, setSelected: (selected: number) => void }) {
	const htmlFor = title.replaceAll(' ', '');
	return <>
		<input
			type="radio"
			className="btn-check"
			onChange={() => setSelected(id)}
			name="btnradio"
			id={htmlFor}
			autoComplete="off"
			checked={selected === id}
		/>
		<label className="btn btn-outline-dark" htmlFor={htmlFor}>{title}</label>
	</>;
}

export function QuestionPage({
	evaluationQuestion,
	children
}: {
	evaluationQuestion: IEvaluationQuestion,
	children: React.ReactChild
}) {
	const [selectedAnswer, setSelectedAnswer] = React.useState<number>(-1);
	const [selectedMentalEffort, setSelectedMentalEffort] = React.useState<number>(-1);
	const [submitted, setSubmitted] = React.useState<boolean>(false);
	const { setShowNextButton } = React.useContext(MainContext);

	return <div className="ms-2">
		<div className="my-3">
			{children}
		</div>
		<div>
			<div>
				<h4>Frage {evaluationQuestion.questionId}: {evaluationQuestion.question}</h4>
				<div className="btn-group" role="group" aria-label="Basic radio toggle button group">
					{evaluationQuestion.answerPossibilites
						.map((title, i) => <QuestionPageRadioButton id={i} title={title} selected={selectedAnswer} setSelected={setSelectedAnswer} />)
					}
				</div>
				<div>
					<button onClick={() => setSubmitted(true)} className="btn btn-secondary" disabled={selectedAnswer === -1}>Submit Answer</button>
				</div>
			</div>
			{submitted ? <div>
				<p>How high would you rate the amount of mental effort invested for completing this task?</p>
				<div className="btn-group" role="group" aria-label="Basic radio toggle button group">
					{[1, 2, 3, 4, 5, 6, 7]
						.map((num) => <QuestionPageRadioButton id={num} title={num.toString()} selected={selectedMentalEffort} setSelected={(selected: number) => {
							setSelectedMentalEffort(selected);
							setShowNextButton();
						}} />)
					}
				</div>
			</div> : null}
		</div>
	</div >
}