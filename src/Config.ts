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
export const clientId: string = "d6724175-141c-4a38-a23e-ad289bf246b9";

// Id of the workspace where the report is hosted
export const workspaceId: string = "0a44eb9c-bda3-48e5-b3fb-2f3bf8104d0f";

// Id of the report to be embedded
export const reportId: string = "2cf92bdb-9d49-437d-ab3d-f6c02024cca5";