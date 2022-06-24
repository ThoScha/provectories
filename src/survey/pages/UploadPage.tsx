import React from "react";
import { IExportFeatureVectorRow, IProvenanceQuestion } from "../../utils/interfaces";
import { MailLink } from "../../utils/MailLink";
import { featureVectorizeGraph, featureVectorsToCsvString } from "../../utils/utils";

export function UploadPage({
	questionProvanencesRef,
	age,
	gender,
	dashboardExperience,
	powerBIExperience,
	confidence,
	satisfaction,
	user
}: {
	questionProvanencesRef: React.MutableRefObject<IProvenanceQuestion[]>
	age: number;
	gender: string;
	dashboardExperience: number;
	powerBIExperience: number;
	confidence: number;
	satisfaction: number;
	user: string;
}) {
	const [downloaded, setDownloaded] = React.useState<boolean>(false);
	const [uploadClicked, setUploadClicked] = React.useState<boolean>(false);

	const getCsvString = (): string => {
		// group vectors from each provenance first to cols to avoid different order
		// between cols of different provenances
		const csvCols: { [key: string]: any[] } = {};
		questionProvanencesRef.current.forEach((y, i) => {
			const addCols = {
				user,
				age,
				gender,
				dashboardExperience,
				powerBIExperience,
				confidence,
				satisfaction,
				...Object.keys(y)
					.filter((key) => key !== "provenance")
					.reduce((obj, key) => ({ ...obj, [key]: y[key] }), {})
			};
			let vectors: IExportFeatureVectorRow[] = featureVectorizeGraph(y.provenance, addCols);

			if (Object.keys(csvCols).length === 0) {
				(vectors[0] as string[]).forEach((key) => {
					csvCols[key] = [];
				});
			}

			(vectors[0] as string[]).forEach((key: string, j: number) => {
				vectors.slice(1).forEach((value, i) => {
					csvCols[key].push(value[j]);
				});
			});
		});
		const csvRows: IExportFeatureVectorRow[] = [];
		const keys = Object.keys(csvCols);

		csvRows.push(keys);
		csvCols[keys[0]].forEach((val, i) => {
			csvRows.push(keys.map((key) => csvCols[key][i]));
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
		<h4>To save your answers please click following button to download it as csv-file:</h4>
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
				href="https://cloud.se.jku.at/u/d/f5a9d8ee08a8449d8a41/"
				target="_blank"
				rel="noopener noreferrer"
				onClick={() => setUploadClicked(true)}
			>
				https://cloud.se.jku.at/u/d/f5a9d8ee08a8449d8a41/
			</a>
		</> : null}
		{uploadClicked ? <>
			<h3>Thank you!</h3>
			<p>
				If you have any questions or want further information about the topic
				please just write a mail to: <MailLink mail={'thomas.schachinger@icloud.com'} />.</p>
			<p>To logout just close this window.</p>
		</> : null}
	</div>
}
