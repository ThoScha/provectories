import React from "react";
import { RadioButton } from "../utils/RadioButton";

export function BackgroundQuestionsPage({
	age,
	gender,
	dashboardExperience,
	poweBIExperience,
	confidence,
	setAge,
	setGender,
	setDashboardExperience,
	setPowerBIExperience,
	setConfidence,
	setShowNextButton
}: {
	age: number;
	gender: string;
	dashboardExperience: number;
	poweBIExperience: number;
	confidence: number;
	setAge: (age: number) => void;
	setGender: (gender: string) => void;
	setDashboardExperience: (dashboardExperience: number) => void;
	setPowerBIExperience: (powerBIExperience: number) => void;
	setConfidence: (confidence: number) => void;
	setShowNextButton: (showNextButton: boolean) => void;
}) {

	React.useEffect(() => {
		if (gender.length > 0 && age > 0 && ((confidence !== -1 && dashboardExperience === 1 && poweBIExperience !== -1) || (dashboardExperience === 0))) {
			setShowNextButton(true);
		} else {
			setShowNextButton(false);
		}
		if (dashboardExperience === 0) {
			setConfidence(-1);
			setPowerBIExperience(-1);
		}
	}, [
		gender,
		age,
		confidence,
		dashboardExperience,
		poweBIExperience,
		setConfidence,
		setShowNextButton,
		setPowerBIExperience
	]);

	return <div>
		<h2 className="mb-4">Demographic Information</h2>
		<div className="row my-3">
			<div className="col-8 d-flex align-items-center"><h5>Please indicate your age</h5></div>
			<div className="col-4"><input type="number" min="0" max="100" className="form-control" value={age} onChange={(e) => setAge(e.target.valueAsNumber)} /></div>
		</div>
		<div className="row my-3">
			<div className="col-8 d-flex align-items-center"><h5>Please indicate your gender</h5></div>
			<div className="col-4">
				<div className="btn-group w-100" role="group" aria-label="gender-radio-button-group">
					{(['m', 'f', 'd'])
						.map((gen) => <RadioButton<string>
							htmlFor={`gender-radio-button-${gen}`}
							value={gen}
							title={gen}
							selected={gender}
							setSelected={setGender}
						/>)
					}
				</div>
			</div>
		</div>
		<div className="row my-3">
			<div className="col-8 d-flex align-items-center"><h5>Do you already have experience with Dashboards/Interactive Visual Analytics Tools?</h5></div>
			<div className="col-4">
				<div className="btn-group w-100" role="group" aria-label="dashboard-experience-radio-button-group">
					{[{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }]
						.map((val) => <RadioButton<number>
							htmlFor={`dashboard-experience-radio-button-${val.label}`}
							value={val.value}
							title={val.label}
							selected={dashboardExperience}
							setSelected={setDashboardExperience}
						/>)
					}
				</div>
			</div>
		</div>
		{dashboardExperience === 1 ? <>
			<div className="row my-3">
				<div className="col-8 d-flex align-items-center"><h5>Do you already have experience with Power BI Dashboards?</h5></div>
				<div className="col-4">
					<div className="btn-group w-100" role="group" aria-label="powerBi-experience-radio-button-group">
						{[{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }]
							.map((val) => <RadioButton<number>
								htmlFor={`powerBi-experience-radio-button-${val.label}`}
								value={val.value}
								title={val.label}
								selected={poweBIExperience}
								setSelected={setPowerBIExperience}
							/>)
						}
					</div>
				</div>
			</div>
			<div className="row my-3">
				<div className="col-8 d-flex align-items-center"><h5>How would you rate your confidence in using Dashboards/Interactive Visual Analytics Tools?</h5></div>
				<div className="col-4">
					<div className="btn-group w-100" role="group" aria-label="confidence-radio-button-group">
						{[1, 2, 3, 4, 5, 6]
							.map((num) => <RadioButton<number>
								htmlFor={`confidence-radio-button-${num}`}
								value={num}
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
			</div>
		</> : null}
	</div>
}
