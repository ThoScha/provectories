import * as React from "react";

export function PageRadioButton<T>({ radioButtonId, title, selected, setSelected }: { radioButtonId: T, title: string, selected: T, setSelected: (selected: T) => void }) {
	const htmlFor = title.replaceAll(' ', '') + '-' + radioButtonId;
	return <>
		<input
			type="radio"
			className="btn-check"
			onChange={() => setSelected(radioButtonId)}
			name={htmlFor}
			id={htmlFor}
			autoComplete="off"
			checked={selected === radioButtonId}
		/>
		<label className="btn btn-outline-secondary" htmlFor={htmlFor}>{title}</label>
	</>;
}