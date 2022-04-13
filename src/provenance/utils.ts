import { Report } from "report";
import { IReportBookmark, IExportDataResult } from "powerbi-models";
import { models, VisualDescriptor } from "powerbi-client";

export async function captureBookmark(report: Report): Promise<IReportBookmark | undefined> {
	try {
		return await report.bookmarksManager.capture();
	}
	catch (error) {
		console.error(error);
	}
	return undefined;
}

export async function applyBookmark(bookmark: string, report: Report, skip?: () => boolean): Promise<void> {
	try {
		await report.bookmarksManager.applyState(bookmark);
	}
	catch (error) {
		console.error(error);
	}
}

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

export function makeDeepCopy<T>(obj: T): T {
	return typeof obj === 'object' ? JSON.parse(JSON.stringify(obj)) : obj;
}

export function toTitle(title: string): string {
	return title.replaceAll(" ", "");
}

const roleToAttributeMap = {
	'Y': 'yAxis',
	'Category': 'xAxis',
	'Series': 'Legend',
	'Values': 'Field'
};

export async function getVisualAttributeMapper(visual: VisualDescriptor): Promise<{ [key: string]: string }> {
	const mapper: { [key: string]: string } = {};

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

	return mapper;
}
