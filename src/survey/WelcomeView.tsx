import React from "react";

export function WelcomeView({ setSurveyView }: { setSurveyView: (surveView: boolean) => void }) {
    return <div className="m-3">
        <h2>Welcome to the survey of Provectories</h2>
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
        <h4>How to start</h4>
        <ol>
            <li>When you start you will get asked to login with an email address and a password.</li>
            <li><b>Please use the below provided user credentials for the login.</b></li>
            <li>Click on the "Start survey"-button to begin.</li>
        </ol>
        <div className="card mt-4" style={{ width: 320 }}>
            <div className="card-body">
                <h4 className="mb-1">Login information:</h4>
                <p className="ms-1">
                    Username: <i>survey@provectories.onmicrosoft.com</i><br />
                    Password: <i>Dashboard22</i>
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => setSurveyView(true)}
                >
                    Start survey
                </button>
            </div>
        </div>
        <h4>Please don't forget to upload your result CSV-file in the end - otherwise no results will be saved!</h4>
    </div>
}