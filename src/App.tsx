import * as React from "react";
import "./App.css";
import { getPage } from "./constants";
import { UserAgentApplication, AuthError, AuthResponse } from "msal";
import * as config from "./Config";

export const MainContext = React.createContext<{ embedUrl: string, error: string[], accessTokenRef: React.MutableRefObject<string>, setShowNextButton: () => void }>({ embedUrl: '', error: [], accessTokenRef: {} as React.MutableRefObject<string>, setShowNextButton: () => null });

export function App() {
	const [page, setPage] = React.useState<number>(0);
	const [embedUrl, setEmbedUrl] = React.useState<string>('');
	const [error, setError] = React.useState<string[]>([]);
	const [showNextButton, setShowNextButton] = React.useState<boolean>(false);
	const accessTokenRef = React.useRef<string>('');

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

	return <MainContext.Provider value={React.useMemo(() => ({ embedUrl, error, accessTokenRef, setShowNextButton: () => setShowNextButton(true) }), [embedUrl, error, accessTokenRef, setShowNextButton])}>
		<div>
			<h2 id="title">
				Provectories: New Hires Example
			</h2>
			<div className="card m-1 overflow-auto" style={{ height: '85vh' }}>
				<div className="card-body">
					{getPage()[page]}
				</div>
			</div>
			{showNextButton ? <button type="button" className="btn btn-primary" onClick={() => nextPage()}>Next</button> : null}
		</div></MainContext.Provider>;
}