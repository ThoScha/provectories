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
export const clientId: string = "1792bed2-974a-4310-9a61-aefe921dcb59";

// Id of the workspace where the report is hosted
export const workspaceId: string = "ee69ff6f-a178-4528-81f3-c48716951cc6";

// Id of the report to be embedded
export const reportId: string = "c5c7899e-52df-4a76-962f-8fd0c3537480";