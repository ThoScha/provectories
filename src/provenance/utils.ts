import { Report } from "report";
import { IReportBookmark, IExportDataResult } from "powerbi-models";
import { models, VisualDescriptor } from "powerbi-client";
import 'powerbi-report-authoring';
import { Provenance } from "@visdesignlab/trrack";
import { IProvectories, IAppState, IFeatureVector } from "./interfaces";


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
				console.error('exportData', err);
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
			.getPages().then(async (pages) => pages[1]
				.getVisuals().then((visuals) => visuals
					.filter((v) => v.type !== 'card' && v.type !== 'shape')));
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
function appStateToFeatureVector(currState: IAppState, rootState: IAppState): IFeatureVector {
	const featureVector: IFeatureVector = {};
	Object.keys(rootState).forEach((vKey) => {
		const { visState, selected, type } = currState[vKey];
		const rootVisState = rootState[vKey].visState;
		Object.keys(rootVisState).forEach((aKey) => {
			const rootAttribute = rootVisState[aKey];
			const currAttribute = visState[aKey];
			const vector = (featureVector[vKey + '.' + aKey] = []) as number[][];
			// number arrays will be used as they are
			if (typeof rootAttribute[0] === 'number') {
				vector.push(currAttribute.length > 0 ? currAttribute as number[] : [0]);
			} else { // string arrays will be encoded
				vector.push(
					...rootAttribute.map((root) => {
						const vec = [selected && selected[aKey] === root ? 1 : 0]; // if selected 1
						// slicers can't be filtered
						if (type !== 'slicer') {
							vec.push(currAttribute.includes(root) ? 0 : 1); // if filtered then 1 (included = !filtered)
						}
						return vec;
					})
				);
			}
		});
	});
	return featureVector;
}

/**
 * Goes through graph, returns feature vector row for each node and returns feature vector matrix
 * @param provenance Provenance object to featurize
 */
export function featureVectorizeGraph(provenance: Provenance<IProvectories, string, void>): (string[] | number[][][])[] {
	const { root, graph } = provenance;
	const featureVectors: (string[] | number[][][])[] = [];

	Object.keys(graph.nodes).forEach((key) => {
		const currNode = graph.nodes[key];
		const currVector = appStateToFeatureVector(
			provenance.getState(currNode.id).appState, provenance.getState(root.id).appState
		);
		// adding header row
		if (key === root.id) {
			featureVectors.push(['time', ...Object.keys(currVector)]);
		}
		const newRow: number[][][] = [[[currNode.metadata.createdOn || -1]]];
		// skip first column since time is no key in feature vector
		newRow.push(...(featureVectors[0] as string[]).slice(1).map((title: string) => currVector[title]));
		featureVectors.push(newRow);
	});
	console.log(featureVectors);
	return featureVectors;
}

/**
 * Takes feature vector matrix and converts it to a csv-string
 * @param featureVectors Feature vector matrix
 */
export function featureVectorsToCsvString(featureVectors: (string[] | number[][][])[]): string {
	let vectorString = 'data:text/csv;charset=utf-8,';
	featureVectors.forEach((row, idx) => {
		if (idx === 0) {
			vectorString += row.join(';') + '\r\n';
		} else {
			(row as number[][][]).forEach((cell, i) => {
				let newString = JSON.stringify(cell).slice(1, -1);
				// removes brackets for single value vector
				if (cell[0].length === 1) {
					newString = newString.replaceAll('[', '').replaceAll(']', '');
				}
				vectorString += newString;
				vectorString += i < row.length - 1 ? ';' : '\r\n'
			});
		}
	});
	return vectorString;
}

/**
 * Returns csv file representing feature vectors of a provenance graph
 * @param provenance Provenance object to convert to csv
 */
export function downloadGraphAsFeatVecCsv(provenance: Provenance<IProvectories, string, void>): void {
	window.open(encodeURI(featureVectorsToCsvString(featureVectorizeGraph(provenance))));
}
