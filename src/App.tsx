import * as React from "react";
import { UserAgentApplication, AuthError, AuthResponse } from "msal";
import { v4 as uuid } from 'uuid';
import * as config from "./power-bi/Config";
import { BackgroundQuestionsPage } from "./pages/BackgroundQuestionsPage";
import { FirstPage } from "./pages/DSGVOPage";
import { LastPage } from "./pages/LastPage";
import { QuestionPage } from "./pages/QuestionPage";
import { SatisfactionQuestionPage } from "./pages/SatisfactionQuestionPage";
import { EVALUATION_QUESTIONS } from "./utils/constants";
import { Report } from "powerbi-client";
import { provenance } from "./provenance/Provectories";
import { ICurrentQuestion, IQuestionProvenance } from "./utils/interfaces";
import _ from "lodash";

const USER: string = uuid();

export function App() {
	const [page, setPage] = React.useState<number>(0);
	const [questionCount, setQuestionCount] = React.useState<number>(0);
	const [embedUrl, setEmbedUrl] = React.useState<string>('');
	const [error, setError] = React.useState<string[]>([]);
	const [showNextButton, setShowNextButton] = React.useState<boolean>(false);
	const [disableNextButton, setDisableNExtButton] = React.useState<boolean>(false);
	const [age, setAge] = React.useState<number>(0);
	const [gender, setGender] = React.useState<string>('')
	const [experience, setExperience] = React.useState<string>('');
	const [confidence, setConfidence] = React.useState<number>(-1);
	const [satisfaction, setSatisfaction] = React.useState<number>(-1);
	const accessTokenRef = React.useRef<string>('');
	const reportRef = React.useRef<Report>();
	const currentQuestionRef = React.useRef<ICurrentQuestion | null>(null);
	const questionProvanencesRef = React.useRef<IQuestionProvenance[]>([]);

	const onNextPageButtonClick = async () => {
		setDisableNExtButton(true);
		// only set in question pages
		if (currentQuestionRef.current) {
			// wait for background async provenance track calls to be finished
			await new Promise((resolve) => {
				setTimeout(() => {
					//checkin again bc this could be null already
					if (currentQuestionRef.current) {
						questionProvanencesRef.current.push({
							...currentQuestionRef.current,
							provenance: _.cloneDeep(provenance),
							endtime: new Date().getTime()
						});
					}
					currentQuestionRef.current = null;
					resolve(-1);
				}, 1500)
			});
		}
		setPage((prevState) => prevState + 1);
		if (age > 0 && gender.length > 0 && experience.length > 0) {
			setQuestionCount((prevState) => prevState + 1);
		}
		setShowNextButton(false);
		setDisableNExtButton(false);
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

	const pages: React.ReactNode = React.useMemo<React.ReactNode>(() => {
		switch (page) {
			case 0:
				return <FirstPage setShowNextButton={setShowNextButton} />;
			case 1:
				return <BackgroundQuestionsPage
					age={age}
					gender={gender}
					experience={experience}
					confidence={confidence}
					setAge={setAge}
					setGender={setGender}
					setExperience={setExperience}
					setConfidence={setConfidence}
					setShowNextButton={setShowNextButton}
				/>;
			case 2: case 3: case 4: case 5: case 6: case 7: case 8: case 9:
				return <QuestionPage
					evaluationQuestion={EVALUATION_QUESTIONS[questionCount]}
					reportRef={reportRef}
					accessTokenRef={accessTokenRef}
					currentQuestionRef={currentQuestionRef}
					embedUrl={embedUrl}
					error={error}
					setShowNextButton={setShowNextButton}
				/>;
			case 10:
				return <SatisfactionQuestionPage
					satisfaction={satisfaction}
					setSatisfaction={setSatisfaction}
					setShowNextButton={setShowNextButton}
				/>;
			case 11:
				return <LastPage
					questionProvanencesRef={questionProvanencesRef}
					age={age}
					gender={gender}
					experience={experience}
					confidence={confidence}
					satisfaction={satisfaction}
					user={USER}
				/>
			default:
				return <p>Invalid page number!</p>
		}
	}, [
		age,
		page,
		gender,
		experience,
		confidence,
		satisfaction,
		embedUrl,
		error,
		questionCount,
		setAge,
		setGender,
		setConfidence,
		setExperience,
		setSatisfaction,
		setShowNextButton
	]);

	return (
		<div className="d-flex flex-column">
			<div >
				<h2 id="title" className="m-0 p-1">
					Provectories: New Hires Example
				</h2>
			</div>
			<div className="card m-1 overflow-auto" style={{ height: '88vh' }}>
				<div className="card-body">
					{pages}
				</div>
			</div>
			<div className="d-flex justify-content-between mx-1">
				<p className="text-muted">{questionCount > 0 && questionCount < 9 ? `Question ${questionCount}/8` : null}</p>
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
