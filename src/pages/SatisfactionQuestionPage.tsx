import React from "react";
import { PageRadioButton } from "./PageRadioButton";

export function SatisfactionQuestionPage({
	dashboardSatisfactionRef,
	setShowNextButton
}: {
	dashboardSatisfactionRef: React.MutableRefObject<number>;
	setShowNextButton: (showNextButton: boolean) => void;
}) {
	const [satisfaction, setSatisfaction] = React.useState<number>(-1);

	React.useEffect(() => {
		if (satisfaction > -1) {
			setShowNextButton(true);
			dashboardSatisfactionRef.current = satisfaction;
		}
	}, [satisfaction]);

	return <div>
		<h3 className="mb-4">User Experience</h3>
		<div className="row my-3">
			<div className="row mb-3">
				<h4>How satisfied are you with of your experience of information retrieval based on the previous used dashboard?</h4>
			</div>
			<div className="row w-75">
				<div className="btn-group w-100" role="group" aria-label="satisfaction-radio-button-group">
					{[1, 2, 3, 4, 5, 6]
						.map((num) => <PageRadioButton<number> radioButtonId={num} title={String(num)} selected={satisfaction} setSelected={setSatisfaction} />)
					}
				</div>
				<div className="d-flex justify-content-between text-muted">
					<i>1 - very low satisfaction</i><i>6 - very high satisfaction</i>
				</div>
			</div>
		</div>
	</div>
}
