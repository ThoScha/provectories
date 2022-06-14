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
	const [readyToAnswer, setReadyToAnswer] = React.useState<boolean>(false);
	const [isSure, setIsSure] = React.useState<boolean>(false);

	React.useEffect(() => {
		setReportLoaded(false)
		reportRef.current?.on("rendered", () => {
			setReportLoaded(true);
			setReadyToAnswer(false);
			setIsSure(false);
			reportRef.current?.off("rendered");
		})
	}, [currentQuestion.questionId, reportRef]);

	return <div className="ms-2">
		<div className="my-3" style={isSure ? { pointerEvents: 'none' } : {}}>
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
				<div className="col-6 d-flex justify-content-center">
					{reportLoaded ? (
						isSure ? (
							<div className="btn-group w-100" role="group" aria-label="evaluation-answer-radio-button-group">
								{Object.keys(currentQuestion.answerPossibilities)
									.map((key) => <RadioButton<number>
										htmlFor={`evaluation-answer-${currentQuestion.questionId}-${key}`}
										value={Number(key)}
										title={currentQuestion.answerPossibilities[key].toString()}
										selected={currentQuestion.answerId}
										setSelected={(answerId: number) => setCurrentQuestion((prev) => ({ ...prev as ICurrentQuestion, answerId }))}
									/>
									)}
							</div>) : readyToAnswer ? <div className="d-flex align-items-center">
								<p className="m-0 text-muted">Are you sure? Accepting will disable the dashboard.</p>
								<button className="btn btn-secondary ms-4" onClick={() => setIsSure(true)}>Answer now</button>
								<button className="btn btn-text-secondary" onClick={() => setReadyToAnswer(false)}>Abort</button>
							</div> : <button type="button" className="btn btn-secondary" onClick={() => setReadyToAnswer(true)}>Ready to answer?</button>
					) : null}
				</div>
			</div>
			{currentQuestion.answerId !== -1 ? <div className="mt-3 row">
				<div className="col-6 d-flex align-items-center">
					<h5>Weight the complexity of the task:</h5>
				</div>
				<div className="col-6">
					<div className="btn-group w-100" role="group" aria-label="mental-effort-radio-button-group">
						{[{ value: 1, title: 'very easy' }, { value: 2, title: 'easy' }, { value: 3, title: 'not so easy' }]
							.map((val) => <RadioButton<number>
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
