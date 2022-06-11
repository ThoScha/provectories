import React from "react";
import { RadioButton } from "../utils/RadioButton";

export function BackgroundQuestionsPage({
	age,
	gender,
	experience,
	confidence,
	setAge,
	setGender,
	setExperience,
	setConfidence,
	setShowNextButton
}: {
	age: number;
	gender: string;
	experience: string;
	confidence: number;
	setAge: (age: number) => void;
	setGender: (gender: string) => void;
	setExperience: (experience: string) => void;
	setConfidence: (confidence: number) => void;
	setShowNextButton: (showNextButton: boolean) => void;
}) {

	React.useEffect(() => {
		if (gender.length > 0 && age > 0 && ((confidence !== -1 && experience === 'Yes') || (experience === 'No'))) {
			setShowNextButton(true);
		} else {
			setShowNextButton(false);
		}
		if (experience === 'No') {
			setConfidence(-1);
		}
	}, [
		gender,
		age,
		confidence,
		experience,
		setConfidence,
		setShowNextButton
	]);

	return <div>
		<h2 className="mb-4">Demographic Information</h2>
		<div className="row my-3">
			<div className="col-8"><h5>Please indicate your age</h5></div>
			<div className="col-4"><input type="number" min="0" max="100" className="form-control" value={age} onChange={(e) => setAge(e.target.valueAsNumber)} /></div>
		</div>
		<div className="row my-3">
			<div className="col-8"><h5>Please indicate your gender</h5></div>
			<div className="col-4">
				<div className="btn-group w-100" role="group" aria-label="gender-radio-button-group">
					{(['m', 'f', 'd'])
						.map((gen) => <RadioButton<string>
							key={`gender-radio-button-${gen}`}
							radioButtonId={gen}
							title={gen}
							selected={gender}
							setSelected={setGender}
						/>)
					}
				</div>
			</div>
		</div>
		<div className="row my-3">
			<div className="col-8"><h5>Do you already have experience with Dashboards/Interactive Visual Analytics Tools?</h5></div>
			<div className="col-4">
				<div className="btn-group w-100" role="group" aria-label="experience-radio-button-group">
					{['Yes', 'No']
						.map((label) => <RadioButton<string>
							key={`experience-radio-button-${label}`}
							radioButtonId={label}
							title={label}
							selected={experience}
							setSelected={setExperience}
						/>)
					}
				</div>
			</div>
		</div>
		{experience === 'Yes' ?
			<div className="row my-3">
				<div className="col-8"><h5>How would you rate your confidence in using Dashboards/Interactive Visual Analytics Tools?</h5></div>
				<div className="col-4">
					<div className="btn-group w-100" role="group" aria-label="confidence-radio-button-group">
						{[1, 2, 3, 4, 5, 6]
							.map((num) => <RadioButton<number>
								key={`confidence-radio-button-${num}`}
								radioButtonId={num}
								title={String(num)}
								selected={confidence}
								setSelected={setConfidence}
							/>)
						}
					</div>
					<div className="d-flex justify-content-between text-muted">
						<i>1 - very low confidence</i><i>6 - very high confidence</i>
					</div>
				</div>
			</div> : null}
	</div>
}
