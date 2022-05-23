import { Report } from "report";
import { setupProvenance } from "./Provenance";
import { IAppState, IProvectories } from "./interfaces";
import { captureBookmark, exportData, toCamelCaseString, getCurrentVisuals, makeDeepCopy, getVisualAttributeMapper } from "./utils";
import { Provenance } from "@visdesignlab/trrack";

export const provenance: Provenance<IProvectories, string, void> = {} as Provenance<IProvectories, string, void>;

function setProvenance(newProvenance: Provenance<IProvectories, string, void>) {
	Object.keys(newProvenance).forEach((key) => {
		provenance[key] = newProvenance[key];
	});
}

class Provectories {
	private readonly appState: IAppState;
	private readonly bookmark: { current: string };
	private readonly report: Report;

	constructor(report: Report) {
		this.appState = {};
		this.bookmark = { current: '' };
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
		if (dataPoints.length > 0) {
			const visDesc = visuals[toCamelCaseString(title)];
			dataPoints[0].identity.forEach((i: any, idx: number) => {
				visDesc.selected = { ...visDesc.selected, [i.target.column]: i.equals };
				label += `${idx > 0 ? ', ' : ''}${i.target.column}: ${i.equals}`;
			});
			return label + ' selected';
		}
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
					currArr.length : Array.from(new Set(currArr as string[]));
			});
		}));
		return appState;
	};

	/**
	 * Captures bookmark of the current dashboard state, sets it in the bookmarkRef and returns bookmark
	 * Only possible if report is loaded
	 */
	async setBookmark(): Promise<string> {
		return await captureBookmark(this.report).then((captured) => {
			const bookmark = captured?.state || '';
			this.bookmark.current = bookmark;
			return bookmark;
		});
	};

	/**	
	* Initialize appState
	* Only possible if report is loaded
	*/
	async initAppState() {
		const visuals = await getCurrentVisuals(this.report);
		visuals.forEach((v) => {
			const title = toCamelCaseString(v.title);
			if (this.appState && !this.appState[title]) {
				this.appState[toCamelCaseString(title)] = { selected: null, type: v.type, visState: {} };
			}
		});
	};

	/**
	 * initializes provenance, click-event handler and the appState
	 */
	async init(): Promise<void> {
		await this.initAppState();
		const appState = await this.setVisState(this.appState);
		const bookmark = await this.setBookmark();
		const { actions, provenance } = setupProvenance(
			this.report, { appState, bookmark }, this.bookmark
		);

		setProvenance(provenance);

		this.report?.on("dataSelected", async (event: any) => {
			const label = this.setVisSelected(event);
			const bookmark = await this.setBookmark();

			// function call is done in provenance for better performance on the dashboard
			const onDashboardClick = async () => {
				const appState = await this.setVisState(makeDeepCopy(this.appState));
				return { newState: { bookmark, appState }, label };
			};

			actions.event(onDashboardClick);
		});
	};
}

export function provectories(report: Report): void {
	new Provectories(report);
}