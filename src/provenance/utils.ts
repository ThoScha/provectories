import { Report } from "report";
import { IReportBookmark, IExportDataResult } from "powerbi-models";
import { models, VisualDescriptor } from "powerbi-client";
import 'powerbi-report-authoring';
import { IAppState, IExportFeatureVectorRow, IFeatureVector, IProvectories } from "./interfaces";
import { Provenance } from "@visdesignlab/trrack/dist/Types/Provenance";

/**
 * Captures and returns current bookmark
 * @param report Report to capture bookmark from
 */
export async function captureBookmark(report: Report): Promise<IReportBookmark | undefined> {
	try {
		return await report.bookmarksManager.capture();
	}
	catch (error) {
		console.error(error);
	}
	return undefined;
}

/**
 * Applies given bookmark on report
 * @param bookmark Bookmark to apply to
 * @param report Report to apply bookmark on
 */
export async function applyBookmark(bookmark: string, report: Report): Promise<void> {
	try {
		await report.bookmarksManager.applyState(bookmark);
	}
	catch (error) {
		console.error(error);
	}
}

/**
 * Exports underlying data of given visual and handles errors
 * @param visual Visual to get underlying data from
 */
export async function exportData(visual: VisualDescriptor): Promise<IExportDataResult | null> {
	// starting on 12/16/2021, exportData throws error.
	// If call exportData repeatedly a few times then it starts to work.
	// Implement pattern to try 4 times before throwing an error

	let tries = 0;
	let result: models.IExportDataResult | null = null;
	while (tries < 4) {
		try {
			result = await visual.exportData(models.ExportDataType.Summarized);
			break;
		} catch (err) {
			tries++;
			if (tries === 4) {
				console.error(('exportData - ' + visual.title), err);
				// console.error(`exportData [tries]: ${tries}`);
			}
		}
	}
	return result;
}

/**
 * Create exact copy of object without referencing on it
 * @param obj Object to copy
 */
export function makeDeepCopy<T extends Object>(obj: T): T {
	return typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj;
}

/**
 * Takes string and returns multiple word string as one word camel case string
 * @param title String to be camel cased
 */
export function toCamelCaseString(title: string): string {
	return title
		.split(' ')
		.map((t, i) => i === 0 ? t : t[0].toUpperCase() + t.slice(1))
		.join('');
}

/**
 * Categorizes columns of agiven visual to their attribute of the chart in a dict and returns it 
 * @param visual 
 */
export async function getVisualAttributeMapper(visual: VisualDescriptor): Promise<{ [key: string]: string }> {
	// const roleToAttributeMap = {
	// 	'Y': 'yAxis',
	// 	'Category': 'xAxis',
	// 	'Series': 'Legend',
	// 	'Values': 'Field'
	// };

	const mapper: { [key: string]: string } = {};
	if (visual.getCapabilities) {
		const capabilities = await visual.getCapabilities();
		if (capabilities.dataRoles) {
			await Promise.all(capabilities.dataRoles.map(async (role) => {
				const dataFields = await visual.getDataFields(role.name);
				if (dataFields.length > 0) {
					await Promise.all(dataFields.map(async (d, idx) => {
						const attribute = await visual.getDataFieldDisplayName(role.name, idx);
						// mapper[toCamelCaseString(attribute)] = roleToAttributeMap[role.name];
						mapper[toCamelCaseString(attribute)] = role.name;
					}));
				}
			}))
		}
	}
	return mapper;
}

/**
 * Extracts current visuals from a dashboard of a report and returns them in an array
 * @param report Report to extract visuals from
 * Only possible if report is loaded
 */
export async function getCurrentVisuals(report: Report): Promise<VisualDescriptor[]> {
	try {
		return report
			.getPages().then(async (pages) => pages.filter((page) => page.isActive)[0]
				.getVisuals().then((visuals) => visuals
					.filter((v) => v.type !== 'card' && v.type !== 'shape' && v.type !== 'textbox')));
	} catch (err) {
		console.error(err);
		return [];
	}
}

/**
	* Takes an appState and encodes it as a feature vector. Needs initial app state to know if an attribute is filtered
	* @param currState State to encode as a feature vector
	* @param rootState Initial app state
	*/
export function appStateToFeatureVector(currState: IAppState, rootState: IAppState): IFeatureVector {
	const featureVector: IFeatureVector = {};
	const selectedColumns = new Set<string>();
	const filteredColumns = new Set<string>();
	Object.keys(rootState).forEach((vKey) => {
		const { visState, selected, type } = currState[vKey];
		const rootVisState = rootState[vKey].visState;
		Object.keys(rootVisState).forEach((aKey) => {
			const rootAttribute = rootVisState[aKey];
			const currAttribute = visState[aKey];
			let columnTitle = vKey + '.' + aKey;
			const vector = [] as number[];
			// number arrays will be used as they are
			if (typeof rootAttribute[0] === 'number') {
				columnTitle += "<numerical>";
				vector.push(...(currAttribute.length > 0 ? currAttribute as number[] : [0]));
			} else { // string arrays will be encoded
				columnTitle += "<categorical>";
				(rootAttribute as string[]).forEach((root) => {
					if (selected && selected[aKey]?.includes(root)) {// if selected 1 : 0
						vector.push(1);
						selectedColumns.add(columnTitle);
					} else {
						vector.push(0)
					}
					if (type !== 'slicer') { // slicers can't be filtered
						if ((currAttribute as string[]).includes(root)) { // if filtered then 1 (included = !filtered)
							vector.push(0);
						} else {
							vector.push(1);
							filteredColumns.add(columnTitle);
						}
					}
				});
			}
			featureVector[columnTitle] = vector;
		});
	});

	return { selectedValues: Array.from(selectedColumns).join(", ") || "", filteredValues: Array.from(filteredColumns).join(", ") || "", ...featureVector };
};

/**
 * Goes through graph, returns feature vector row for each node and returns feature vector matrix
 * @param provenance Provenance object to featurize
 */
export function featureVectorizeGraph(provenance: Provenance<IProvectories, string, void>, addCols: { [title: string]: string | number } = {}): IExportFeatureVectorRow[] {
	const { root, graph } = provenance;
	const featureVectors: IExportFeatureVectorRow[] = [];

	Object.keys(graph.nodes).forEach((key) => {
		const currNode = graph.nodes[key];
		const currVector = appStateToFeatureVector(
			provenance.getState(currNode.id).appState, provenance.getState(root.id).appState
		);
		// adding header row
		if (key === root.id) {
			featureVectors.push(['timestamp', ...Object.keys(addCols), 'triggeredAction', ...Object.keys(currVector)]);
		}
		const newRow: IExportFeatureVectorRow = [currNode.metadata.createdOn || -1, ...Object.values(addCols), currNode.label];
		// skip first column since time is no key in feature vector
		(featureVectors[0] as string[]).slice(3 + Object.keys(addCols).length).forEach((title) => newRow.push(currVector[title] ? currVector[title] : ""));
		featureVectors.push(newRow);
	});
	return featureVectors;
}

/**
 * Takes feature vector matrix and converts it to a csv-string
 * @param exportFeatureVectorRows Feature vector matrix
 */
export function featureVectorsToCsvString(exportFeatureVectorRows: IExportFeatureVectorRow[]): string {
	let csvString = 'data:text/csv;charset=utf-8,';
	exportFeatureVectorRows.forEach((row, idx) => {
		if (idx === 0) {
			csvString += row.join(';') + '\r\n';
		} else {
			(row as IExportFeatureVectorRow).forEach((cell, i) => {
				let newString = typeof cell === "string" ? cell : JSON.stringify(cell);
				// removes brackets
				newString = newString.replaceAll('[', '').replaceAll(']', '');
				csvString += newString;
				csvString += i < row.length - 1 ? ';' : '\r\n'
			});
		}
	});
	return csvString;
}
