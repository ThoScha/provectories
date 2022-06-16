import { Report } from 'powerbi-client';
import * as React from 'react';
import { ProvectoriesDashboard } from '../power-bi/ProvectoriesDashboard';
import { ICurrentQuestion } from '../utils/interfaces';
import { RadioButton } from '../utils/RadioButton';

export function QuestionPage({
	reportRef,
	embedUrl,
	error,
	accessTokenRef,
	currentQuestion,
	setCurrentQuestion,
	setShowNextButton,
}: {
	reportRef: React.MutableRefObject<Report | undefined>;
	embedUrl: string;
	error: string[];
	accessTokenRef: React.MutableRefObject<string>;
	currentQuestion: ICurrentQuestion;
	setCurrentQuestion: React.Dispatch<React.SetStateAction<ICurrentQuestion | null>>;
	setShowNextButton: (showNextButton: boolean) => void;
}) {
	const [reportLoaded, setReportLoaded] = React.useState<boolean>(false);
	const [selectedAnswers, setSelectedAnswers] = React.useState<string[]>([]);

	React.useEffect(() => {
		setReportLoaded(false);
		setSelectedAnswers([...Object.keys(currentQuestion.answerPossibilities).map(() => "")]);
		reportRef.current?.on("rendered", () => {
			setReportLoaded(true);
			reportRef.current?.off("rendered");
		})
	}, [currentQuestion.questionId, currentQuestion.answerPossibilities, reportRef]);

	React.useEffect(() => {
		setCurrentQuestion((prev) => ({ ...prev as ICurrentQuestion, selectedAnswer: selectedAnswers.join(" ") }))
	}, [selectedAnswers, setCurrentQuestion]);

	return <div className="ms-2">
		<div className="my-3">
			<ProvectoriesDashboard
				reportRef={reportRef}
				accessTokenRef={accessTokenRef}
				embedUrl={embedUrl}
				error={error}
				questionId={currentQuestion.questionId}
			/>
		</div>
		<div>
			<div className="row">
				<div className="col-6 d-flex align-items-center">
					<h5>{currentQuestion.question}</h5>
				</div>
				<div className="col-6 d-flex justify-content-center align-items-center">
					{reportLoaded && selectedAnswers.length > 0 ? <>
						{Object.keys(currentQuestion.answerPossibilities).map((key, i) =>
							<React.Fragment key={`${currentQuestion.questionId}-${key}`}>{
								key === 'numeric' ? <>
									<h5 className='form-label my-0 mx-2 text-capitalize'>
										Answer:
									</h5>
									<input
										value={selectedAnswers[i]}
										onChange={(e) => {
											const newVal = e.target.value;
											setSelectedAnswers((prevState) =>
												[...prevState.map((p, j) => j === i ? newVal : p)]
											);
										}}
										type="text"
										className="form-control"
										aria-label={`${currentQuestion.questionId}-${key}-input`}
									/>
								</> : <>
									<h5 className='form-label my-0 mx-2 text-capitalize'>
										{key}:
									</h5>
									<select
										className="form-select"
										value={selectedAnswers[i] || ''}
										onChange={(e) => {
											const newVal = e.target.value;
											setSelectedAnswers((prevState) =>
												[...prevState.map((p, j) => j === i ? newVal : p)]
											);
										}}
										aria-label={`${currentQuestion.questionId}-${key}-select`}
									>
										<option disabled value=""></option>
										{currentQuestion.answerPossibilities[key].map((answer) =>
											<option
												key={`${currentQuestion.questionId}-${answer}`}
												value={answer}
											>
												{answer}
											</option>
										)}
									</select>
								</>
							}</React.Fragment>
						)}
					</> : null}
				</div>
			</div>
			{selectedAnswers.every((a) => a.length > 0) ? <div className="mt-4 row">
				<div className="col-6 d-flex align-items-center">
					<h5>Rate the complexity of the task:</h5>
				</div>
				<div className="col-6">
					<div className="btn-group w-100" role="group" aria-label="mental-effort-radio-button-group">
						{[{ value: 1, title: 'very easy' }, { value: 2, title: 'easy' }, { value: 3, title: 'not so easy' }]
							.map((val) => <RadioButton<number>
								key={`mental-effort-radio-button-${val.title}`}
								htmlFor={`mental-effort-radio-button-${val.title}`}
								value={val.value}
								title={val.title}
								selected={currentQuestion.mentalEffort}
								setSelected={(mentalEffort: number) => {
									setCurrentQuestion((prev) => ({ ...prev as ICurrentQuestion, mentalEffort }));
									setShowNextButton(true);
								}}
							/>)
						}
					</div>
				</div>
			</div> : null}
		</div>
	</div >
}
