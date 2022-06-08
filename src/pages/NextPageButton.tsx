import * as React from "react";

export const NextPageButton = ({ onButtonClick }: { onButtonClick: () => void }) =>
    <button type="button" className="btn btn-primary" onClick={() => onButtonClick()}>Next</button>;