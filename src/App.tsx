import * as React from "react";
import "./App.css";
import { UserAgentApplication, AuthError, AuthResponse } from "msal";
import * as config from "./Config";
import { BackgroundQuestionsPage } from "./pages/BackgroundQuestionsPage";
import { FirstPage } from "./pages/DSGVOPage";
import { LastPage } from "./pages/LastPage";
import { QuestionPage } from "./pages/QuestionPage";
import { SatisfactionQuestionPage } from "./pages/SatisfactionQuestionPage";
import { EVALUATION_QUESTIONS } from "./constants";
import { ProvectoriesDashboard } from "./ProvectoriesDashboard";
import { Report } from "powerbi-client";
import { provectories } from "./provenance/Provectories";

export function App() {
	const [page, setPage] = React.useState<number>(0);
	const [embedUrl, setEmbedUrl] = React.useState<string>('');
	const [error, setError] = React.useState<string[]>([]);
	const [showNextButton, setShowNextButton] = React.useState<boolean>(false);
	const accessTokenRef = React.useRef<string>('');
	const userGenderRef = React.useRef<string>('');
	const userAgeRef = React.useRef<number>(-1);
	const dashboardExperienceRef = React.useRef<number>(-1);
	const dashboardConfidenceRef = React.useRef<number>(-1);
	const dashboardSatisfactionRef = React.useRef<number>(-1);
	const reportRef = React.useRef<Report>();

	const nextPage = () => {
		setPage((prevState) => prevState + 1);
		setShowNextButton(false);
	};

	// Power BI REST API call to get the embed URL of the report
	const getembedUrl = React.useCallback(() => {
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
	}, [accessTokenRef, config]);

	const authenticate = React.useCallback(() => {
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
	}, [getembedUrl]);

	React.useEffect(() => {
		// User input - null check
		if (config.workspaceId === "" || config.reportId === "") {
			setError(["Please assign values to workspace Id and report Id in Config.ts file"]);
		} else {
			// Authenticate the user and generate the access token
			authenticate();
		}
	}, [config, authenticate]);

	const pages: { [page: number]: React.ReactNode } = React.useMemo<{ [page: number]: React.ReactNode }>(() => ({
		0: <FirstPage setShowNextButton={setShowNextButton} />,
		1: <BackgroundQuestionsPage
			dashboardConfidenceRef={dashboardConfidenceRef}
			dashboardExperienceRef={dashboardExperienceRef}
			userAgeRef={userAgeRef}
			userGenderRef={userGenderRef}
			setShowNextButton={setShowNextButton}
		/>,
		2: <QuestionPage evaluationQuestion={EVALUATION_QUESTIONS[0]} setShowNextButton={setShowNextButton}>
			<ProvectoriesDashboard
				reportRef={reportRef}
				accessTokenRef={accessTokenRef}
				embedUrl={embedUrl}
				error={error}

			/>
		</QuestionPage>,
		3: <QuestionPage evaluationQuestion={EVALUATION_QUESTIONS[1]} setShowNextButton={setShowNextButton}>
			<ProvectoriesDashboard
				reportRef={reportRef}
				accessTokenRef={accessTokenRef}
				embedUrl={embedUrl}
				error={error}
			/>
		</QuestionPage>,
		4: <SatisfactionQuestionPage
			dashboardSatisfactionRef={dashboardSatisfactionRef}
			setShowNextButton={setShowNextButton}
		/>,
		5: <LastPage
			dashboardConfidenceRef={dashboardConfidenceRef}
			dashboardExperienceRef={dashboardExperienceRef}
			userAgeRef={userAgeRef}
			userGenderRef={userGenderRef}
			dashboardSatisfactionRef={dashboardSatisfactionRef}
			reportRef={reportRef}
		/>
	}), [EVALUATION_QUESTIONS, page]);

	return (
		<div>
			<h2 id="title" className="m-0 p-1">
				Provectories: New Hires Example
			</h2>
			<div className="card m-1 overflow-auto" style={{ height: '88vh' }}>
				<div className="card-body">
					{pages[page]}
				</div>
			</div>
			{showNextButton ? <button type="button" style={{ width: '12vh' }} className="btn btn-primary float-end me-1" onClick={() => nextPage()}>Next</button> : null}
		</div>
	);
}