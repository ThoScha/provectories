import * as React from "react";

export function RadioButton<T>({ htmlFor, value, title, selected, setSelected }: { htmlFor: string, value: T, title: string, selected: T, setSelected: (selected: T) => void }) {
	return <>
		<input
			type="radio"
			className="btn-check"
			onChange={() => setSelected(value)}
			name={String(htmlFor)}
			id={String(htmlFor)}
			autoComplete="off"
			checked={selected === value}
		/>
		<label className="btn btn-outline-secondary" htmlFor={String(htmlFor)}>{title}</label>
	</>;
}