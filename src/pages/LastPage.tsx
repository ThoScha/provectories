import { Report } from "powerbi-client";
import React from "react";
import { DownloadAsCSVBtn } from "../provenance/DownloadAsCSVBtn";

export function LastPage({
	userGenderRef,
	userAgeRef,
	dashboardExperienceRef,
	dashboardConfidenceRef,
	dashboardSatisfactionRef,
	reportRef
}: {
	userGenderRef: React.MutableRefObject<string>;
	userAgeRef: React.MutableRefObject<number>;
	dashboardExperienceRef: React.MutableRefObject<number>;
	dashboardConfidenceRef: React.MutableRefObject<number>;
	dashboardSatisfactionRef: React.MutableRefObject<number>;
	reportRef: React.MutableRefObject<Report | undefined>;
}) {
	return <div>
		<h2>Thank you for attending!</h2>
		<h4>To save your provenance status please click following button to download it as csv-file</h4>
		{reportRef.current ? <DownloadAsCSVBtn report={reportRef.current} /> : null}

		<h4>When downloaded please upload your created csv-file here:</h4>
		<a
			href="https://drive.google.com/drive/folders/1ZJAY7lLsvxNEv2QYFxpPi_8Pn7v4uv0n?usp=sharing"
			target="_blank"
		>
			https://drive.google.com/drive/folders/1ZJAY7lLsvxNEv2QYFxpPi_8Pn7v4uv0n?usp=sharing
		</a>
		<p>gender: {userGenderRef.current}</p>
		<p>age: {userAgeRef.current}</p>
		<p>experience: {dashboardExperienceRef.current}</p>
		<p>confidence: {dashboardConfidenceRef.current}</p>
		<p>satisfaction: {dashboardSatisfactionRef.current}</p>
	</div>
}
