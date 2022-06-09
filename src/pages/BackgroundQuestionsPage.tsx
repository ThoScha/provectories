import React from "react";
import { PageRadioButton } from "./PageRadioButton";

export function BackgroundQuestionsPage({
	userGenderRef,
	userAgeRef,
	dashboardExperienceRef,
	dashboardConfidenceRef,
	setShowNextButton
}: {
	userGenderRef: React.MutableRefObject<string>;
	userAgeRef: React.MutableRefObject<number>;
	dashboardExperienceRef: React.MutableRefObject<number>;
	dashboardConfidenceRef: React.MutableRefObject<number>;
	setShowNextButton: (showNextButton: boolean) => void;
}) {
	const [gender, setGender] = React.useState<string>('');
	const [age, setAge] = React.useState<number>(0);
	const [confidence, setConfidence] = React.useState<number>(-1);
	const [experience, setExperience] = React.useState<string>('');

	React.useEffect(() => {
		if (gender.length > 0 && age > 0 && ((confidence !== -1 && experience === 'Yes') || (experience === 'No'))) {
			userGenderRef.current = gender;
			userAgeRef.current = age;
			dashboardExperienceRef.current = experience === 'No' ? 0 : 1;
			dashboardConfidenceRef.current = confidence;
			setShowNextButton(true);
		} else {
			setShowNextButton(false);
		}
		if (experience === 'No') {
			setConfidence(-1);
			dashboardConfidenceRef.current = -1;
		}
	}, [gender, age, confidence, experience]);

	return <div>
		<h3 className="mb-4">Demographic Information</h3>
		<div className="row my-3">
			<div className="col-8"><h5>Please indicate your age?</h5></div>
			<div className="col-4"><input type="number" min="0" max="100" className="form-control" value={age} onChange={(e) => setAge(e.target.valueAsNumber)} /></div>
		</div>
		<div className="row my-3">
			<div className="col-8"><h5>Please indicate your gender?</h5></div>
			<div className="col-4">
				<div className="btn-group w-100" role="group" aria-label="gender-radio-button-group">
					{(['m', 'w', 'd'])
						.map((gen) => <PageRadioButton<string> radioButtonId={gen} title={gen} selected={gender} setSelected={setGender} />)
					}
				</div>
			</div>
		</div>
		<div className="row my-3">
			<div className="col-8"><h5>Do you already have experience with Dashboards/Interactive Visual Analytics Tools?</h5></div>
			<div className="col-4">
				<div className="btn-group w-100" role="group" aria-label="experience-radio-button-group">
					{['Yes', 'No']
						.map((label) => <PageRadioButton<string> radioButtonId={label} title={label} selected={experience} setSelected={setExperience} />)
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
							.map((num) => <PageRadioButton<number> radioButtonId={num} title={String(num)} selected={confidence} setSelected={setConfidence} />)
						}
					</div>
					<div className="d-flex justify-content-between text-muted">
						<i>1 - very low confidence</i><i>6 - very high confidence</i>
					</div>
				</div>
			</div> : null}
	</div>
}
