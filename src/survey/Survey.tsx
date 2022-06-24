import * as React from "react";
import { UserAgentApplication, AuthError, AuthResponse } from "msal";
import { v4 as uuid } from 'uuid';
import * as config from "../power-bi/Config";
import { DemographicsPage } from "./pages/DemographicsPage";
import { DataProtectionPage } from "./pages/DataProtectionPage";
import { UploadPage } from "./pages/UploadPage";
import { QuestionPage } from "./pages/QuestionPage";
import { UsabilityEvaluationPage } from "./pages/UsabilityEvaluationPage";
import { EVALUATION_QUESTIONS } from "../utils/constants";
import { Report } from "powerbi-client";
import { provenance } from "../provenance/Provectories";
import { ICurrentQuestion, IProvenanceQuestion } from "../utils/interfaces";
import _ from "lodash";
import { ProcedurePage } from "./pages/ProcedurePage";
import { OnboardingPage } from "./pages/OnboardingPage";

const USER: string = uuid();

export function Survey() {
	const [age, setAge] = React.useState<number>(0);
	const [error, setError] = React.useState<string[]>([]);
	const [gender, setGender] = React.useState<string>('')
	const [embedUrl, setEmbedUrl] = React.useState<string>('');
	const [confidence, setConfidence] = React.useState<number>(-1);
	const [pageNumber, setPageNumber] = React.useState<number>(1);
	const [satisfaction, setSatisfaction] = React.useState<number>(-1);
	const [showNextButton, setShowNextButton] = React.useState<boolean>(false);
	const [currentQuestion, setCurrentQuestion] = React.useState<ICurrentQuestion | null>(null);
	const [disableNextButton, setDisableNExtButton] = React.useState<boolean>(false);
	const [powerBIExperience, setPowerBIExperience] = React.useState<number>(-1);
	const [dashboardExperience, setDashboardExperience] = React.useState<number>(-1);
	const questionProvanencesRef = React.useRef<IProvenanceQuestion[]>([]);
	const accessTokenRef = React.useRef<string>('');
	const reportRef = React.useRef<Report>();

	// adjust when adding page before question pages
	const questionNumber = pageNumber - 4;

	const onNextPageButtonClick = async () => {
		setDisableNExtButton(true);
		// only set in question pages
		if (currentQuestion) {
			// wait for background async provenance track calls to be finished
			await new Promise((resolve) => {
				setTimeout(() => {
					questionProvanencesRef.current.push({
						...(_.omit(currentQuestion, ['answerPossibilities', 'question'])),
						provenance: _.cloneDeep(provenance),
						endtime: new Date().getTime()
					});
					resolve(-1);
				}, 1500);
			});
		}
		// check for values before the question pages and if there is a next question
		if (
			questionNumber > -1 &&
			questionNumber < (EVALUATION_QUESTIONS.length)
		) {
			setCurrentQuestion({ ...EVALUATION_QUESTIONS[questionNumber], mentalEffort: -1, selectedAnswer: "" });
		} else { // no next question
			setCurrentQuestion(null);
		}
		setDisableNExtButton(false);
		setShowNextButton(false);
		setPageNumber((prevState) => prevState + 1);
	};

	const currentPage: React.ReactNode = React.useMemo<React.ReactNode>(() => {
		switch (pageNumber) {
			case 1:
				setShowNextButton(true);
				return <ProcedurePage />
			case 2:
				return <DataProtectionPage setShowNextButton={setShowNextButton} />;
			case 3:
				return <DemographicsPage
					age={age}
					gender={gender}
					confidence={confidence}
					poweBIExperience={powerBIExperience}
					dashboardExperience={dashboardExperience}
					setDashboardExperience={setDashboardExperience}
					setPowerBIExperience={setPowerBIExperience}
					setShowNextButton={setShowNextButton}
					setConfidence={setConfidence}
					setGender={setGender}
					setAge={setAge}
				/>;
			case 4:
				setShowNextButton(true);
				return <OnboardingPage />
			case 5: case 6: case 7: case 8: case 9: case 10: case 11: case 12:
				return currentQuestion ?
					<QuestionPage
						error={error}
						embedUrl={embedUrl}
						reportRef={reportRef}
						accessTokenRef={accessTokenRef}
						currentQuestion={currentQuestion}
						setCurrentQuestion={setCurrentQuestion}
						setShowNextButton={setShowNextButton}
					/> : <p>Invalid question number</p>;
			case 13:
				return <UsabilityEvaluationPage
					satisfaction={satisfaction}
					setSatisfaction={setSatisfaction}
					setShowNextButton={setShowNextButton}
				/>;
			case 14:
				return <UploadPage
					age={age}
					user={USER}
					gender={gender}
					confidence={confidence}
					satisfaction={satisfaction}
					powerBIExperience={powerBIExperience}
					dashboardExperience={dashboardExperience}
					questionProvanencesRef={questionProvanencesRef}
				/>
			default:
				return <p>Invalid page number!</p>
		}
	}, [
		age,
		error,
		gender,
		embedUrl,
		confidence,
		pageNumber,
		satisfaction,
		currentQuestion,
		powerBIExperience,
		dashboardExperience,
		setDashboardExperience,
		setPowerBIExperience,
		setCurrentQuestion,
		setShowNextButton,
		setSatisfaction,
		setConfidence,
		setGender,
		setAge,
	]);

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
	}, [accessTokenRef]);

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
	}, [authenticate]);

	return (
		<div className="d-flex flex-column">
			<div >
				<h2 id="title" className="m-0 p-1">
					Provectories: New Hires Example
				</h2>
			</div>
			<div className="card m-1 overflow-auto" style={{ height: '88vh' }}>
				<div className="card-body">
					{currentPage}
				</div>
			</div>
			<div className="d-flex justify-content-between mx-1">
				<p className="text-muted">{
					currentQuestion ? `Question ${questionNumber}/${EVALUATION_QUESTIONS.length}` : null
				}</p>
				{showNextButton ?
					<button
						className="btn btn-primary"
						onClick={() => onNextPageButtonClick()}
						disabled={disableNextButton}
						type="button"
						style={{ width: '12vh' }}
					>
						{disableNextButton ? 'Loading...' : 'Next'}
					</button>
					: null}
			</div>
		</div>
	);
}
