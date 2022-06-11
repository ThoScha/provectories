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

	React.useEffect(() => {
		setReportLoaded(false)
		reportRef.current?.on("rendered", () => {
			setReportLoaded(true);
			reportRef.current?.off("rendered");
		})
	}, [currentQuestion.questionId, reportRef]);

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
				<div className="col-6">
					<h5>{currentQuestion.question}</h5>
				</div>
				<div className="col-6">
					<div className="btn-group w-100" role="group" aria-label="evaluation-answer-radio-button-group">
						{reportLoaded ? Object.keys(currentQuestion.answerPossibilities)
							.map((key) => <RadioButton<number>
								key={`evaluation-answer-${currentQuestion.questionId}-${key}`}
								radioButtonId={Number(key)}
								title={currentQuestion.answerPossibilities[key].toString()}
								selected={currentQuestion.answerId}
								setSelected={(answerId: number) => setCurrentQuestion((prev) => ({ ...prev as ICurrentQuestion, answerId }))}
							/>)
							: null}
					</div>
				</div>
			</div>
			{currentQuestion.answerId !== -1 ? <div className="mt-3 row">
				<div className="col-6">
					<h5>How high would you rate the amount of mental effort invested for completing this task?</h5>
				</div>
				<div className="col-6">
					<div className="btn-group w-100" role="group" aria-label="mental-effort-radio-button-group">
						{[1, 2, 3, 4, 5, 6]
							.map((num) => <RadioButton<number>
								key={`mental-effort-radio-button-${num}`}
								radioButtonId={num}
								title={num.toString()}
								selected={currentQuestion.mentalEffort}
								setSelected={(mentalEffort: number) => {
									setCurrentQuestion((prev) => ({ ...prev as ICurrentQuestion, mentalEffort }));
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
