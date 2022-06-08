import * as React from "react";
import "./App.css";
import { getPage } from "./constants";

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
			{getPage(nextPage)[page]}
		</div>
	</div>;
}