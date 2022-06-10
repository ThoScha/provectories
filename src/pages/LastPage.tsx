import React from "react";
import { IExportFeatureVectorRow, IQuestionProvenance } from "../utils/interfaces";
import { featureVectorizeGraph, featureVectorsToCsvString } from "../utils/utils";

export function LastPage({
	questionProvanencesRef,
	age,
	gender,
	experience,
	confidence,
	satisfaction,
	user
}: {
	questionProvanencesRef: React.MutableRefObject<IQuestionProvenance[]>
	age: number;
	gender: string;
	experience: string;
	confidence: number;
	satisfaction: number;
	user: string;
}) {
	const [downloaded, setDownloaded] = React.useState<boolean>(false);
	const [uploadClicked, setUploadClicked] = React.useState<boolean>(false);

	const getCsvString = (): string => {
		const csvRows: IExportFeatureVectorRow[] = [];
		questionProvanencesRef.current.sort((a, b) => a.questionId - b.questionId).forEach((y, i) => {
			const addCols = { user, age, gender, experience, confidence, satisfaction };
			Object.keys(y).filter((key) => key !== "provenance").forEach((key) => addCols[key] = y[key]);
			let vectors: IExportFeatureVectorRow[] = featureVectorizeGraph(y.provenance, addCols);
			if (i > 0) {
				vectors = vectors.slice(1);
			}
			csvRows.push(...vectors);
		});
		return featureVectorsToCsvString(csvRows);
	}

	const downloadGraphAsFeatVecCsv = (): void => {
		const uri = encodeURI(getCsvString());
		const anchor = document.createElement('a');
		anchor.style.display = 'none';
		if ("download" in anchor) {
			anchor.download = `provectories-${user}.csv`;
			anchor.href = uri;
			anchor.click();
		} else {
			window.open(uri, '_self');
		}
		anchor.remove();
	};

	return <div>
		<h2>Thank you for attending!</h2>
		<h4>To save your provenance status please click following button to download it as csv-file</h4>
		<button
			className="btn btn-secondary"
			type="button"
			onClick={() => {
				downloadGraphAsFeatVecCsv();
				setDownloaded(true);
			}}
		>
			Download CSV
		</button>
		{downloaded ? <>
			<h4>When downloaded please upload your created csv-file here:</h4>
			<a
				href="https://drive.google.com/drive/folders/1ZJAY7lLsvxNEv2QYFxpPi_8Pn7v4uv0n?usp=sharing"
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => setUploadClicked(true)}
			>
				https://drive.google.com/drive/folders/1ZJAY7lLsvxNEv2QYFxpPi_8Pn7v4uv0n?usp=sharing
			</a>
		</> : null}
		{uploadClicked ? <>
			<h3>Thank you!</h3>
			<p>To logout just close this window</p>
		</> : null}
	</div>
}
