import * as config from "./power-bi/Config";
import { UserAgentApplication } from "msal/lib-commonjs/UserAgentApplication";
import React from "react";
import { Survey } from "./survey/Survey";
import { WelcomeView } from "./survey/WelcomeView";

export function App() {
    const [suveryView, setSurveyView] = React.useState<boolean>(false);

    return <div>
        {//Go to survey view if no login login is triggered if already logged in redirect
            suveryView || new UserAgentApplication({ auth: { clientId: config.clientId } }).getAccount() ?
                <Survey />
                :
                <WelcomeView setSurveyView={setSurveyView} />
        }
    </div>
}