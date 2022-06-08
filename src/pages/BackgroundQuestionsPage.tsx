import React from "react";
import { NextPageButton } from "./NextPageButton";

export function BackgroundQuestionsPage({ nextPage }: { nextPage: () => void }) {
    return <div>
        <h2>Demographic Information</h2>
        <NextPageButton onButtonClick={nextPage} />
    </div>
}