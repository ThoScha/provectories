import { Report } from "report";
import { IReportBookmark, IExportDataResult } from "powerbi-models";
import { models, VisualDescriptor } from "powerbi-client";
import 'powerbi-report-authoring';

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
			.getPages().then(async (pages) => pages.filter((page) => page.isActive)[0]
				.getVisuals().then((visuals) => visuals
					.filter((v) => v.type !== 'card' && v.type !== 'shape')));
	} catch (err) {
		console.error(err);
		return [];
	}
}
