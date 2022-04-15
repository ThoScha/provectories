import React from "react";
import { Page, Report, VisualDescriptor } from 'powerbi-client';
import 'powerbi-report-authoring';
import * as models from "powerbi-models";

interface ButtonProps { myReport: any | Report };

class Button extends React.Component<ButtonProps, {}> {

    private report: any | Report = null;
    private pages: Page[] = [];
    private visuals: VisualDescriptor[] = [];
    private initialData: { type: string; result: models.IExportDataResult }[] = [];//{type: '', result: {data : ''}}[4];

    render(): JSX.Element {
        return (
            <div>
                <button onClick={this.showVisInfo.bind(this)}>Log Visual Info</button>
            </div>
        );
    }

    async showVisInfo(): Promise<void> {
        this.report = this.props.myReport as Report;
        this.pages = await this.report.getPages();
        this.visuals = await this.pages[1].getVisuals();

        console.log('Visual numbers: ', this.visuals.length);

        for (const visual of this.visuals) {
            if (visual.type !== 'slicer' && visual.type !== 'card') {

                const xFields: any = await visual.getDataFields('Category');
                console.log(xFields);

                const xLabel = await visual.getDataFieldDisplayName('Category', 0);
                const yFields: any = await visual.getDataFields('Y');

                console.log(xLabel)
                console.log(yFields)

                if (models.isMeasure(yFields[0])) {
                    const yField1 = yFields[0].measure;
                    console.log(yField1)
                }

                const yLabel0 = await visual.getDataFieldDisplayName('Y', 0);
                console.log(yLabel0);
            }
        }
    }
}

export default Button;

