import React from "react";
import { RadioButton } from "../../utils/RadioButton";

export function UsabilityEvaluationPage({
	satisfaction,
	setSatisfaction,
	setShowNextButton
}: {
	satisfaction: number;
	setSatisfaction: (satisfaction: number) => void;
	setShowNextButton: (showNextButton: boolean) => void;
}) {

	React.useEffect(() => {
		if (satisfaction > -1) {
			setShowNextButton(true);
		}
	}, [satisfaction, setShowNextButton]);

	return <div>
		<h3 className="mb-4">User Experience</h3>
		<div className="row my-3">
			<div className="row mb-3">
				<h4>How would you rate the usability of the hiring dashboard?</h4>
			</div>
			<div className="row w-75">
				<div className="btn-group w-100" role="group" aria-label="satisfaction-radio-button-group">
					{[1, 2, 3, 4, 5, 6]
						.map((num) => <RadioButton<number>
							key={`satisfaction-radio-button-${num}`}
							htmlFor={`satisfaction-radio-button-${num}`}
							value={num}
							title={String(num)}
							selected={satisfaction}
							setSelected={setSatisfaction}
						/>)
					}
				</div>
				<div className="d-flex justify-content-between text-muted">
					<i>1 - very low usability</i><i>6 - very high usability</i>
				</div>
			</div>
		</div>
	</div>
}
