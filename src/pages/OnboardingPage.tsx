import React from "react";
import Onboarding from "../utils/NewHiresDashboardOnboarding.png"


export function OnboardingPage() {
    return <div>
        <h2>Onboarding</h2>
        <img style={{ width: '65%' }} alt={"Description of the new hires dashboard."} src={Onboarding} />
        <h4>Description</h4>
        <div className="row mt-3">
            <ol className="ms-4">
                <li>Number of new hires</li>
                <li>Number of new hires from the same period last year (= SPLY)</li>
                <li>New hires and the new hires from the same period last year (= SPLY) broken down by months</li>
                <li>Distribution of new hires categorized by full-time and part-time description (= FPDesc)</li>
                <li>New hires broken down by ethnicity</li>
                <li>New hires categorized by region</li>
                <li>Filter dashboard by year</li>
                <li>Filter dashboard by ethnicity</li>
                <li>Filter dashboard by region</li>
            </ol>
            <p>
                The data shown in the visualizations and aggregations (1 - 6) is influenced by applied
                filters and selections. Basically, the visualizations and aggregations represent the same
                data but differently categorized, except SPLY values. SPLY values display the number
                of hires for the same filters and selection but from the previous year. Interacting
                with the dashboard influences all visualizations and aggregations by highlighting selected
                data and hiding filtered data.
            </p>
            <h4>Possibilities to interact with the dashboard:</h4>
            <ul className="ms-4">
                <li>Selecting by clicking on elements (data points and legends) in the visualization (elements 3 - 6)</li>
                <li>Applying filters by clicking on the filters (elements 7 - 9)</li>
                <li>Ctrl + Click (Cmd + Click for macOS) allows multi-selecting for visualization elements and filters (elements 3 - 9)</li>
                <li>Visualizations also allow drag-selection for selecting multiple data points at once (elements 3 - 6)</li>
            </ul>
        </div>
    </div >;
}