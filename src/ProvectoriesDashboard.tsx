// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

import * as React from "react";
import { service, factories, models, IEmbedConfiguration, Report } from "powerbi-client";
import "./App.css";
import { provectories } from "./provenance/Provectories";
import { MainContext } from "./App";
import * as config from "./Config";

const powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);

export function ProvectoriesDashboard() {
	const { error, embedUrl, accessTokenRef } = React.useContext(MainContext);
	const reportRef = React.useRef<HTMLDivElement>(null);

	const renderMyReport = React.useCallback((): Report | undefined => {
		let report: any | Report = null;
		if (error.length) {
			// Cleaning the report container contents and rendering the error message in multiple lines
			reportRef.current!.textContent = "";
			error.forEach(line => {
				reportRef.current!.appendChild(document.createTextNode(line));
				reportRef.current!.appendChild(document.createElement("br"));
			});
			console.log('Error', error);
		} else if (accessTokenRef.current !== "" && embedUrl !== "") { // comment this condition

			const embedConfiguration: IEmbedConfiguration = {
				type: "report",
				tokenType: models.TokenType.Aad,
				accessToken: accessTokenRef.current,
				embedUrl,
				permissions: models.Permissions.All,
				id: config.reportId,
				settings: {
					visualRenderedEvents: true,
					panes: {
						filters: {
							visible: true
						},
						pageNavigation: {
							visible: true
						}
					}
				}
			};

			if (reportRef.current) {
				report = powerbi.embed(reportRef.current, embedConfiguration) as Report;

				// Clear any other loaded handler events
				report.off("loaded");

				// Triggers when a content schema is successfully loaded
				report.on("loaded", function () {
					console.log("Report load successful");
					// init provectories
					provectories(report);
				});

				// Clear any other error handler event
				report.off("error");

				// Below patch of code is for handling errors that occur during embedding
				report.on("error", function (event: any) {
					const errorMsg = event.detail;

					// Use errorMsg variable to log error in any destination of choice
					console.error(errorMsg);
				});
			}

			return report;
		} else {
			throw Error("No container for the report");
		}
	}, [error, embedUrl, accessTokenRef, reportRef]);

	// React function TODO:
	// componentWillUnmount(): void {
	// 	powerbi.reset(reportContainer);
	// }

	// Authenticating to get the access token

	React.useEffect(() => {
		renderMyReport();
	}, [renderMyReport]);

	return <div id="reportContainer" className="d-flex mb-1" ref={reportRef} style={{ height: "65vh" }} >
		Loading the report...
	</div>;
}