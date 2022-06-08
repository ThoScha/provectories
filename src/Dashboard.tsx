// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

import * as React from "react";
import { UserAgentApplication, AuthError, AuthResponse } from "msal";
import { service, factories, models, IEmbedConfiguration, Report } from "powerbi-client";
import "./App.css";
import * as config from "./Config";
import { provectories } from "./provenance/Provectories";

const powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);

export function Dashboard() {
	const [embedUrl, setEmbedUrl] = React.useState<string>();
	const [error, setError] = React.useState<string[]>([]);
	const reportRef = React.useRef<HTMLDivElement>(null);
	const accessTokenRef = React.useRef<string>();

	const renderMyReport = (): Report | undefined => {
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
	}

	// React function TODO:
	// componentWillUnmount(): void {
	// 	powerbi.reset(reportContainer);
	// }

	// Authenticating to get the access token
	const authenticate = () => {
		const msalConfig = {
			auth: {
				clientId: config.clientId
			}
		};

		const loginRequest = {
			scopes: config.scopes
		};

		const msalInstance: UserAgentApplication = new UserAgentApplication(msalConfig);

		const successCallback = (response: AuthResponse) => {

			if (response.tokenType === "id_token") {
				authenticate();
			} else if (response.tokenType === "access_token") {
				accessTokenRef.current = response.accessToken;
				getembedUrl();
			} else {
				setError([("Token type is: " + response.tokenType)])
			}
		}

		const failCallBack = (error: AuthError) => {
			setError(["Redirect error: " + error]);
		};

		msalInstance.handleRedirectCallback(successCallback, failCallBack);

		// check if there is a cached user
		if (msalInstance.getAccount()) {
			// get access token silently from cached id-token
			msalInstance.acquireTokenSilent(loginRequest)
				.then((response: AuthResponse) => {
					// get access token from response: response.accessToken
					accessTokenRef.current = response.accessToken;
					getembedUrl();
				})
				.catch((err: AuthError) => {

					// refresh access token silently from cached id-token
					// makes the call to handleredirectcallback
					if (err.name === "InteractionRequiredAuthError") {
						msalInstance.acquireTokenRedirect(loginRequest);
					}
					else {
						setError([err.toString()]);
					}
				});
		} else {
			// user is not logged in or cached, you will need to log them in to acquire a token
			msalInstance.loginRedirect(loginRequest);
		}
	}

	// Power BI REST API call to get the embed URL of the report
	const getembedUrl = () => {
		fetch("https://api.powerbi.com/v1.0/myorg/groups/" + config.workspaceId + "/reports/" + config.reportId, {
			headers: {
				"Authorization": "Bearer " + accessTokenRef.current
			},
			method: "GET"
		})
			.then(function (response) {
				const errorMessage: string[] = [];
				errorMessage.push("Error occurred while fetching the embed URL of the report")
				errorMessage.push("Request Id: " + response.headers.get("requestId"));

				response.json()
					.then((body) => {
						// Successful response
						if (response.ok) {
							// setAccessToken(accessToken);
							setEmbedUrl(body["embedUrl"]);
						}
						// If error message is available
						else {
							errorMessage.push("Error " + response.status + ": " + body.error.code);
							setError(errorMessage);
						}
					})
					.catch(function () {
						errorMessage.push("Error " + response.status + ":  An error has occurred");
						setError(errorMessage);
					});
			})
			.catch(function (error) {
				// Error in making the API call
				setError(error);
			});
	};

	React.useEffect(() => {
		// User input - null check
		if (config.workspaceId === "" || config.reportId === "") {
			setError(["Please assign values to workspace Id and report Id in Config.ts file"]);
		} else {
			// Authenticate the user and generate the access token
			authenticate();
		}
	}, []);

	const myReport = renderMyReport();

	return <div id="reportContainer" ref={reportRef} style={{ display: 'flex', flex: 1, marginBottom: 5, height: "85vh" }} >
		Loading the report...
	</div>;
}