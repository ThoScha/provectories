// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

import * as React from "react";
import { service, factories, models, IEmbedConfiguration, Report } from "powerbi-client";
import "./App.css";
import { provectories } from "./provenance/Provectories";
import * as config from "./Config";

const powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);

export function ProvectoriesDashboard({ reportRef,
	error,
	embedUrl,
	accessTokenRef
}: {
	reportRef: React.MutableRefObject<Report | undefined>,
	embedUrl: string,
	error: string[],
	accessTokenRef: React.MutableRefObject<string>
}) {
	const reportContainerRef = React.useRef<HTMLDivElement>(null);

	const renderMyReport = React.useCallback((): Report | undefined => {
		let report: any | Report = null;
		if (error.length) {
			// Cleaning the report container contents and rendering the error message in multiple lines
			reportContainerRef.current!.textContent = "";
			error.forEach(line => {
				reportContainerRef.current!.appendChild(document.createTextNode(line));
				reportContainerRef.current!.appendChild(document.createElement("br"));
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

			if (reportContainerRef.current) {
				report = powerbi.embed(reportContainerRef.current, embedConfiguration) as Report;

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
	}, [error, embedUrl, accessTokenRef, reportContainerRef]);

	React.useEffect(() => {
		reportRef.current = renderMyReport();
		return () => {
			if (reportContainerRef.current) {
				powerbi.reset(reportContainerRef.current);
			}
		}
	}, [renderMyReport]);

	return <div id="reportContainer" className="d-flex mb-1" ref={reportContainerRef} style={{ height: "65vh" }} >
		Loading the report...
	</div>;
}