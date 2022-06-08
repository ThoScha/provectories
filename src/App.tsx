import * as React from "react";
import "./App.css";
import { Dashboard } from "./Dashboard";
import { QuestionPage } from "./pages/QuestionPage";

export function App() {
	const [page, setPage] = React.useState<number>(0);

	const nextPage = () => {
		setPage((prevState) => prevState + 1);
	};

	return <div>
		<h2 id="title">
			Provectories: New Hires Example
		</h2>
		<div>
			<QuestionPage>
				<Dashboard />
			</QuestionPage>
		</div>
		<div id="footer">
			<button type="button" className="ui button" onClick={() => nextPage()}>Next {page}</button>
		</div>
	</div>;
}