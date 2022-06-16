import * as React from "react";

export function WelcomePage() {
	return <div>
		<h2>Welcome to the survery of Provectories</h2>
		<h4>Provectories</h4>
		<p>
			Provectories is an approach for applying a provenance meta-analysis by visualizing a set of interaction provenance.
			In this case provenance is a possibility to track application states influenced by users' interactions on applications.
			Provenance data can be used to recall application states at given time for example to allow jumping between states in
			a running application, share states or, for this research, to get insights on how users interact with a given tool.
		</p>
		<p>
			The goal of this research is to apply the provectories approach on a feature rich application like a dashboard. By analyzing
			the provenance data we want to find out if this approach can help to get insights of the usability of a given tool and thus
			find ways to improve the user experience of dashboards based on this insights. Therefore, with this survey, we want to collect
			interaction provenance data of an example dashboard for further analysis.
		</p>
		<h4>Procedure</h4>
		<ul>
			<li>No sensitive personal data will be collected in this survey. Details can be found on the next page.</li>
			<li>Before the survey starts you will be asked about your age, gender and experiences with dashboards.</li>
			<li>
				There will then be a brief onboarding on the new hires dashboard that will be used describing the elements,
				behaviour and its interaction possibilites.
			</li>
			<li>The following 8 questions can be answered by using the implemented dashboard.</li>
			<li>After each question you will be asked to rate the complexity of the task.</li>
			<li>When you are done with all tasks, there will be an evaluation of the usability of the tool.</li>
			<li>Finally, you will be asked to safe your answers. Therefore, please follow the instructions on the last page.</li>
			<li>Overall this survey will take about 10 minutes.</li>
			<li>Please be patient with the tool - it might take a few seconds until the dashboard is fully loaded when switching pages.</li>
		</ul>
		<h3>Thank you for your participation!</h3>
	</div>
}