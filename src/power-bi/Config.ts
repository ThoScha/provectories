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
export const clientId: string = "f1f98e67-aeb3-406c-a3f6-8c90654a8562";

// Id of the workspace where the report is hosted
export const workspaceId: string = "0223b04f-f0a4-43c6-9dbe-e152236e6a5a";

// Id of the report to be embedded
export const reportId: string = "7c8477cc-60dc-4edf-a9f0-71b6f1b575da";