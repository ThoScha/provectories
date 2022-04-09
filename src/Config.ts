// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-inferrable-types */

// Scope of AAD app. Use the below configuration to use all the permissions provided in the AAD app through Azure portal.
// Refer https://aka.ms/PowerBIPermissions for complete list of Power BI scopes
// https://analysis.windows.net/powerbi/api/Report.Read.All
export const scopes: string[] = ["https://analysis.windows.net/powerbi/api/Report.Read.All"];

// Client Id (Application Id) of the AAD app.
export const clientId: string = "8907c50f-2760-4f23-8310-0dd4b59a3d4e";

// Id of the workspace where the report is hosted
export const workspaceId: string = "b4d89c91-9284-45e7-92e1-3fd0f59cf20f";

// Id of the report to be embedded
export const reportId: string = "44d6556a-c8ca-451c-9f24-51ebfd04ab69";