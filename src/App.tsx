// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

import React, { RefObject } from "react";
import { UserAgentApplication, AuthError, AuthResponse } from "msal";
import { service, factories, models, IEmbedConfiguration, Report } from "powerbi-client";
import "./App.css";
import * as config from "./Config";
import { provectories } from "./provenance/Provectories";
import { DownloadAsCSVBtn } from "./provenance/DownloadAsCSVBtn";
const powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);

let accessToken = "";
let embedUrl = "";
let reportContainer: HTMLElement;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AppProps { };
interface AppState { accessToken: string; embedUrl: string; error: string[]; reportRef: RefObject<any>; };

class App extends React.Component<AppProps, AppState> {
	private myReport: any | Report;

	constructor(props: AppProps) {
		super(props);
		this.state = { accessToken: "", embedUrl: "", error: [], reportRef: React.createRef() };
		this.myReport = null;
	}

	// React function
	render(): JSX.Element {
		this.myReport = this.renderMyReport();
		return (<>
			<div style={{ display: 'flex', flexDirection: 'column', margin: 15 }}>
				<div style={{ display: 'flex', flex: 1 }}>
					<div id="reportContainer" ref={this.state.reportRef} style={{ display: 'flex', flex: 1, marginBottom: 5 }} >
						Loading the report...
					</div>
				</div>
				{this.myReport ? <DownloadAsCSVBtn report={this.myReport} forceUpdate={this.forceUpdate.bind(this)} /> : null}
			</div>
		</>);
	}

	// React function
	async componentDidMount(): Promise<void> {

		if (this.state.reportRef !== null) {
			reportContainer = this.state.reportRef["current"];
		}

		// User input - null check
		if (config.workspaceId === "" || config.reportId === "") {
			this.setState({ error: ["Please assign values to workspace Id and report Id in Config.ts file"] })
		} else {

			// Authenticate the user and generate the access token
			this.authenticate();
		}
	}

	renderMyReport(): Report {
		let report: any | Report = null;

		if (this.state.error.length) {
			// Cleaning the report container contents and rendering the error message in multiple lines
			reportContainer.textContent = "";
			this.state.error.forEach(line => {
				reportContainer.appendChild(document.createTextNode(line));
				reportContainer.appendChild(document.createElement("br"));
			});
			console.log('Error', this.state.error);
		} else if (this.state.accessToken !== "" && this.state.embedUrl !== "") { // comment this condition

			const embedConfiguration: IEmbedConfiguration = {
				type: "report",
				tokenType: models.TokenType.Aad,
				accessToken,
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

			report = powerbi.embed(reportContainer, embedConfiguration) as Report;


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
	}

	// React function
	componentWillUnmount(): void {
		powerbi.reset(reportContainer);
	}

	// Authenticating to get the access token
	authenticate(): void {
		const thisObj = this;

		const msalConfig = {
			auth: {
				clientId: config.clientId
			}
		};

		const loginRequest = {
			scopes: config.scopes
		};

		const msalInstance: UserAgentApplication = new UserAgentApplication(msalConfig);

		function successCallback(response: AuthResponse): void {

			if (response.tokenType === "id_token") {
				thisObj.authenticate();

			} else if (response.tokenType === "access_token") {

				accessToken = response.accessToken;
				thisObj.getembedUrl();

			} else {

				thisObj.setState({ error: [("Token type is: " + response.tokenType)] });
			}
		}

		function failCallBack(error: AuthError): void {

			thisObj.setState({ error: ["Redirect error: " + error] });
		}

		msalInstance.handleRedirectCallback(successCallback, failCallBack);

		// check if there is a cached user
		if (msalInstance.getAccount()) {

			// get access token silently from cached id-token
			msalInstance.acquireTokenSilent(loginRequest)
				.then((response: AuthResponse) => {

					// get access token from response: response.accessToken
					accessToken = response.accessToken;
					this.getembedUrl();
				})
				.catch((err: AuthError) => {

					// refresh access token silently from cached id-token
					// makes the call to handleredirectcallback
					if (err.name === "InteractionRequiredAuthError") {
						msalInstance.acquireTokenRedirect(loginRequest);
					}
					else {
						thisObj.setState({ error: [err.toString()] })
					}
				});
		} else {

			// user is not logged in or cached, you will need to log them in to acquire a token
			msalInstance.loginRedirect(loginRequest);
		}
	}

	// Power BI REST API call to get the embed URL of the report
	getembedUrl(): void {
		const thisObj: this = this;

		fetch("https://api.powerbi.com/v1.0/myorg/groups/" + config.workspaceId + "/reports/" + config.reportId, {
			headers: {
				"Authorization": "Bearer " + accessToken
			},
			method: "GET"
		})
			.then(function (response) {
				const errorMessage: string[] = [];
				errorMessage.push("Error occurred while fetching the embed URL of the report")
				errorMessage.push("Request Id: " + response.headers.get("requestId"));

				response.json()
					.then(function (body) {
						// Successful response
						if (response.ok) {
							embedUrl = body["embedUrl"];
							thisObj.setState({ accessToken: accessToken, embedUrl: embedUrl });
						}
						// If error message is available
						else {
							errorMessage.push("Error " + response.status + ": " + body.error.code);

							thisObj.setState({ error: errorMessage });
						}

					})
					.catch(function () {
						errorMessage.push("Error " + response.status + ":  An error has occurred");

						thisObj.setState({ error: errorMessage });
					});
			})
			.catch(function (error) {

				// Error in making the API call
				thisObj.setState({ error: error });
			})
	}
}

export default App;