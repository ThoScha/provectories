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
	const roleToAttributeMap = {
		'Y': 'yAxis',
		'Category': 'xAxis',
		'Series': 'Legend',
		'Values': 'Field'
	};

	const mapper: { [key: string]: string } = {};
	if (visual.getCapabilities) {
		const capabilities = await visual.getCapabilities();
		if (capabilities.dataRoles) {
			capabilities.dataRoles.forEach(async (role) => {
				const dataFields = await visual.getDataFields(role.name);
				if (dataFields.length > 0) {
					await Promise.all(dataFields.map(async (d, idx) => {
						const attribute = await visual.getDataFieldDisplayName(role.name, idx);
						mapper[attribute.replaceAll(" ", "")] = roleToAttributeMap[role.name];
					}));
				}
			})
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
				vector.push(currAttribute.length > 0 ? currAttribute as number[] : [0, 0]);
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
};

/**
 * TODO: make in to two functions, make time better
 * @param provenance 
 */
export function downloadGraphAsFeatVecCsv(provenance: Provenance<IProvectories, string, void>): void {
	let vectorString = 'data:text/csv;charset=utf-8,';
	const { root, graph } = provenance;
	const featureVectors: (string[] | number[][][])[] = [];

	Object.keys(graph.nodes).forEach((key) => {
		const currNode = graph.nodes[key];
		const currVector = appStateToFeatureVector(provenance.getState(currNode.id).appState, provenance.getState(root.id).appState);
		const newRow: number[][][] = [[[currNode.metadata.createdOn || -1]]];
		// adding header row
		if (key === root.id) {
			featureVectors.push(Object.keys(currVector));
			vectorString += featureVectors[0].join(';') + '\r\n';
		}

		vectorString += currNode.metadata.createdOn || -1 + ';';
		(featureVectors[0] as string[]).forEach((title: string, idx: number) => {
			newRow.push(currVector[title]);
			vectorString += JSON.stringify(currVector[title]).slice(1, -1);
			vectorString += idx < featureVectors[0].length - 1 ? ';' : '\r\n'
		});
		featureVectors.push(newRow);
	});

	const encodedUri = encodeURI(vectorString);
	window.open(encodedUri);
};