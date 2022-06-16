import { Report } from "report";
import { setupProvenance } from "./Provenance";
import { IAppState } from "../utils/interfaces";
import { exportData, toCamelCaseString, getCurrentVisuals, makeDeepCopy, getVisualAttributeMapper } from "../utils/utils";
import { Provenance } from "@visdesignlab/trrack";
import 'powerbi-report-authoring';

export const provenance: Provenance<IAppState, string, void> = {} as Provenance<IAppState, string, void>;

function setProvenance(newProvenance: Provenance<IAppState, string, void>) {
	Object.keys(newProvenance).forEach((key) => {
		provenance[key] = newProvenance[key];
	});
}

class Provectories {
	private readonly appState: IAppState;
	private readonly report: Report;

	constructor(report: Report) {
		this.appState = {};
		this.report = report;
		this.init();
	}

	/**
	 * Sets the selected attribute of given visuals extracted from the click-event
	 * Only possible if report is loaded
	 * @param event click-event from dashboard eventlistener
	 */
	setVisSelected(event: any): string {
		const { dataPoints } = event.detail;
		const { type, title } = event.detail.visual;
		const visuals = this.appState;
		let label = `${title} (${type}) - `;

		// clears non slicer values when non slicer selection
		if (type !== 'slicer') {
			Object.keys(visuals).forEach((key) => {
				const visDesc = visuals[key];
				visDesc.selected = visDesc.type !== 'slicer' ? null : visDesc.selected;
			});
		}
		// asign selected values
		const visDesc = visuals[toCamelCaseString(title)];
		if (dataPoints.length > 0) {
			const selections: { [key: string]: string[] } = {};

			dataPoints.forEach((point: any) => {
				point.identity.forEach((i: any) => {
					selections[i.target.column] = [...(selections[i.target.column] ? selections[i.target.column] : []), String(i.equals)];
				});
			});

			Object.keys(selections).forEach((key, i) => {
				label += `${i > 0 ? '. ' : ''}${key}: `;
				visDesc.selected = { ...visDesc.selected, [key]: Array.from(new Set(selections[key])) };
				selections[key].forEach((value, j) => {
					label += `${j > 0 ? ', ' : ''}${value}`;
				})
			})
			return label + ' selected';
		}
		visDesc.selected = null;
		return label + 'deselected';
	};

	/**
	 * Sets the current state of all visuals of the dashboard on given appState
	 * Only possible if report is loaded
	 * @param appState appState object of which the visuals should be set
	 */
	async setVisState(appState: IAppState): Promise<IAppState> {
		const visuals = await getCurrentVisuals(this.report);
		await Promise.all(visuals.map(async (v) => {
			const result = await exportData(v);
			const categoryMapper = await getVisualAttributeMapper(v);
			if (!result) {
				return;
			}
			// vectorize data string && remove last row (empty)
			const data = result.data.replaceAll("\n", "").split('\r').map((d) => d.split(',')).slice(0, -1);
			const groupedData: { [key: string]: any[] } = {};

			// group data columnwise
			data[0].forEach((header, index) => {
				const key = toCamelCaseString(header);
				groupedData[key] = [];
				const currSet = groupedData[key];
				const category = categoryMapper[key];

				data.forEach((row, idx) => {
					// skip headers and empty values
					if (idx === 0 || !row[index]) {
						return;
					}
					const cell = row[index];
					const number = cell.match(/\d+/);
					// only add as number, when cell is not from a category column or legend
					const value = number && category === 'Y' ? parseInt(number[0]) : cell;
					currSet.push(value);
				});
			});

			const { visState } = appState[toCamelCaseString(v.title)];
			// assign to visual state in right format
			Object.keys(groupedData).forEach((key) => {
				const currArr: string[] | number[] = Array.from(groupedData[key]);
				visState[key] = typeof currArr[0] === 'number' ?
					(currArr as number[]) : Array.from(new Set(currArr as string[]));
			});
		}));
		return appState;
	};

	/**	
	* Initialize appState
	* Only possible if report is loaded
	*/
	async initAppState() {
		const visuals = await getCurrentVisuals(this.report);
		await Promise.all(visuals.map(async (v) => { // get initial slicer selection
			let selected: null | { [key: string]: string[] } = null
			if (v.type === 'slicer') {
				const slicerState = await v.getSlicerState();
				selected = {};
				if (slicerState.filters.length > 0) {
					slicerState.filters.forEach((filter: any) => {
						if (!selected![filter.target.column]) {
							selected![filter.target.column] = [];
						}
						selected![filter.target.column].push(...filter.values.map((vals: string | number) => String(vals)));
					});
				}
			}
			const title = toCamelCaseString(v.title);
			if (this.appState && !this.appState[title]) {
				this.appState[toCamelCaseString(title)] = { selected, type: v.type, visState: {} };
			}
		}));
	};

	/**
	 * initializes provenance, click-event handler and the appState
	 */
	async init(): Promise<void> {
		await this.initAppState();
		const appState = await this.setVisState(this.appState);
		const { actions, provenance } = setupProvenance(appState);

		setProvenance(provenance);
		const activePage = (await this.report.getActivePage()).name;

		this.report?.on("dataSelected", async (event: any) => {
			// used closure to check if the current page equals the page provenance is initialized on
			// otherwise the provenance would make no sense for this case
			if (activePage === (await this.report.getActivePage()).name) {
				const label = this.setVisSelected(event);
				const appState = await this.setVisState(makeDeepCopy(this.appState));

				// function call is done in provenance for better performance on the dashboard
				const onDashboardClick = async () => {
					return { newState: appState, label };
				};

				actions.event(onDashboardClick);
			} else {
				console.log("Not on the tracked page");
			}
		});
	};
}

export function provectories(report: Report): void {
	new Provectories(report);
}