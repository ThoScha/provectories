import React from "react";
import { MainContext } from "../App";

export function BackgroundQuestionsPage() {
    const { setShowNextButton } = React.useContext(MainContext);
    const [confirmed, setConfirmed] = React.useState<boolean>(false);

    return <div>
        <h2>Demographic Information</h2>
        <div className="form-check">
            <input
                className="form-check-input"
                type="checkbox"
                id="flexCheckChecked"
                checked={confirmed}
                onChange={(e) => {
                    setConfirmed(e.target.checked);
                    setShowNextButton()
                }} />
            <label className="form-check-label" htmlFor="flexCheckChecked">
                Checked checkbox
            </label>
        </div>
    </div>
}