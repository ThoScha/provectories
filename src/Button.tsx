import React from "react";
import { Page, Report, VisualDescriptor } from 'powerbi-client';
import 'powerbi-report-authoring';
import * as models from "powerbi-models";
import Dashboard from "./Traverse/Dashboard";
import Visual from  "./Traverse/Visual";
import Mark from "./Traverse/Mark";
import Axis from "./Traverse/Axis";
import Insight from "./Traverse/Insight";
import Interaction from "./Traverse/Interaction";

interface ButtonProps {myReport: any | Report};

class Button extends React.Component<ButtonProps, {}> {

    private renderedVis = new Array<string>();
    private report: any | Report = null;
    private pages: Page[] = [];
    private visuals: VisualDescriptor[] = [];
    private dashboardVisuals: Visual[];
    private initialData: {type: string; result: models.IExportDataResult}[] = [];//{type: '', result: {data : ''}}[4];
    private finalData: {type: string; result: models.IExportDataResult}[] = []; //{type: '', result: {data : ''}}[4];
    private dashboard: Dashboard;

    constructor(props: ButtonProps) {
        super(props);
        this.dashboard = new Dashboard([], "Dummy Domain");
        this.dashboardVisuals = new Array<Visual>();
    }

    render(): JSX.Element {
      return (
          <div>
              <button onClick={this.showVisInfo.bind(this)}>Log Visual Info</button>
              <button onClick={this.applyFilter.bind(this)}>Apply Filter</button>
              <button onClick={this.registerEvents.bind(this)}>Register Report Events</button>
              <button onClick={this.getChangedVisuals.bind(this)}>Get Changed Visuals</button>
              <button onClick={this.test.bind(this)}>Test</button>
          </div>
      );
    }

    async test(): Promise<void> {
      this.report = this.props.myReport as Report;
      this.pages = await this.report.getPages();
      this.visuals = await this.pages[1].getVisuals();

      const visual = this.visuals[2];
      console.log(visual);
      visual.getDataFields('Y').then((res) => console.log(res)).catch(e => console.error(e));
      visual.getDataFields('Category').then((res) => console.log(res)).catch(e => console.error(e));
      const result = await visual.exportData(models.ExportDataType.Summarized);
      const data = result.data.split('\r');
      const splitData1 = data[1].split(',');
      const splitDataN = data[data.length - 2].split(',');
      console.log(result)
      console.log(data)
      console.log(splitData1)
      console.log(splitData1[1].replace("\n", "") + " to " + splitDataN[1].replace("\n", ""))
      console.log(splitData1[2].replace("\n", "") + " to " + splitDataN[2].replace("\n", ""))
      console.log(splitDataN)
    }

    async showVisInfo(): Promise<void> {
      this.report = this.props.myReport as Report;
      this.pages = await this.report.getPages();
      this.visuals = await this.pages[1].getVisuals();
      this.dashboardVisuals = new Array<Visual>();

      console.log('Visual numbers: ', this.visuals.length);
      console.log(this.visuals)

      for( const visual of this.visuals) {
        console.log("hi")
        const axis = new Axis();
        const insight = new Insight();
        const mark = new Mark();

        if(visual.type === 'slicer') {
          mark.mark = 'Slider';
          mark.markControls = ['Slide'];
        } else if (visual.type === 'card') {
          mark.mark = 'Text';
          mark.markControls = [];
        } else if (visual.type === 'barChart') {
          mark.mark = 'Bar';
        } else if (visual.type === 'lineChart') {
          mark.mark = 'Line';
        } else if (visual.type === 'clusteredColumnChart') {
          mark.mark = 'Clustured Column Chart';
        } else {
          mark.mark = 'unknown';
        }

        if(visual.type !== 'slicer' && visual.type !== 'card') {

          const xFields: any = await visual.getDataFields('Category');
          let xField = "";

          if(models.isColumn(xFields[0])) {
            xField = xFields[0].column;
          }
          const xLabel = await visual.getDataFieldDisplayName('Category', 0);
          const yFields: any = await visual.getDataFields('Y');
          let yField0 = "";
          let yField1 = "";

          if(models.isMeasure(yFields[0])) {
            yField0 = yFields[0].measure;
          }

          if(yFields[1] && models.isMeasure(yFields[1])) {
            yField1 = yFields[1].measure;
          }

          const yLabel0 = await visual.getDataFieldDisplayName('Y', 0);
          // const yLabel1 = await visual.getDataFieldDisplayName('Y', 1);

          const result = await visual.exportData(models.ExportDataType.Summarized);
          const data = result.data.split('\r');
          const splitData1 = data[1].split(',');
          const splitDataN = data[data.length - 2].split(',');

          this.initialData.push({type: visual.type, result: result});

          axis.xField = xField;
          axis.xLabel = xLabel;
          axis.xRange = splitData1[0].replace("\n", "") + " to " + splitDataN[0].replace("\n", "");
          axis.yField.push(yField0);
          axis.yField.push(yField1);
          axis.yLabel.push(yLabel0);
          // axis.yLabel.push(yLabel1);
          axis.yRange.push(splitData1[1].replace("\n", "") + " to " + splitDataN[1].replace("\n", ""));
          axis.yRange.push(splitData1[2].replace("\n", "") + " to " + splitDataN[2].replace("\n", ""));
          insight.insight = xField + ' ' + splitData1[0].replace("\n", "") + ' ' + yField0 + splitData1[1].replace("\n", "") + ' ' + yField1 + ' ' + splitData1[1].replace("\n", "")
        }

        if(visual.type === 'card') {
          const result = await visual.exportData(models.ExportDataType.Summarized);
          const data = result.data.split('\r');

          this.initialData.push({type: visual.type, result: result});

          axis.xField = data[0].replace("\n", "");
          axis.xLabel = data[0].replace("\n", "");
          axis.xRange = data[1].replace("\n", "");

          insight.insight = axis.xField + ' ' + axis.xRange
        }

        const filters = await visual.getFilters();
        mark.interaction = new Interaction();
        mark.interaction.targets = new Array<models.IFilterGeneralTarget>();
        mark.interaction.filterType = new Array<models.FilterType>();

        for(const filter of filters) {
          mark.interaction.targets.push(filter.target);
          mark.interaction.filterType.push(filter.filterType);
        }

        this.dashboardVisuals.push(new Visual(visual.title, visual.type, axis, insight, mark));
      }
      
     this.dashboard = new Dashboard(this.dashboardVisuals, "Dummy Domain");
     this.dashboard.showDashboardValues();
    }

    async registerEvents(): Promise<void> {

        // Start from here:
        // #1 : Capture what has changed
        // #2 : Which vis have rendered?
        // #3 : Highlighted: Opacity changed
        // #4 : Filtered: Size, Legend, Axis : changed
        // #5 : Display changed information
        // #6 : Create a DFS to show that what has changed will be visited again
        // #7: Create an order of similarly ranked visualizations for the order in the DFS

        this.report.on("dataSelected", function(event: any) {
          console.log('Data Selected'); // , event.detail);
          console.log(event.detail);
        })

        this.report.on("visualRendered", (event: any) => {
          const vis = event.detail.name as string;
          this.renderedVis.push(vis);
        })

        // if you change a visual this is called
        // report.on("selectionChanged", function(event) {
        //   console.log("Selection changed ", event);
        // })

      }

      async getChangedVisuals(): Promise<void> {
          console.log(this.dashboardVisuals)
          this.finalData = [];
          await this.checkVisChanged();

          // Compare intial and finalData
          for(const inData of this.initialData) {
            for(const fiData of this.finalData) {
              if(inData.type === fiData.type) {
                if(inData.result.data === fiData.result.data) {
                  console.log(fiData.type, ' Cross-Highlighting');//, fiData.result.data); // data is not correctly shown
                } else {
                  console.log(fiData.type, ' Cross-Filtering');//, fiData.result.data); //for extra information data can be viewed
                }
              }
            }
          }
      }

      async checkVisChanged(): Promise<void> {
        console.log('test')

        for(const visual of this.visuals) {

          if(this.renderedVis.length) {
            console.log("kuckuk")
            for(const vis of this.renderedVis) {
              console.log("kuckukwww")

              if(vis === visual.name && visual.type !== 'slicer') {
                console.log(visual.type, ' : ', visual.title, ' has rendered again' );
                const result = await visual.exportData(models.ExportDataType.Summarized);
                this.finalData.push({type: visual.type, result: result});
              }
            }
          }
        }
      }

      async applyCrossFilter(): Promise<void> {

      }

      // This applies filter to all the visualization. The initial vis is reduced to show only the values which are contained in the "value" array.
      async applyFilter(): Promise<void> {
        try {
          const filter: models.IBasicFilter = {
            $schema: "http://powerbi.com/product/schema#basic",
            displaySettings: {
              isHiddenInViewMode: false
            },
            target: {
                table: "StateDim",
                column: "State"
            },
            filterType: models.FilterType.Basic,
            operator: "In",
            values:["New York"]

          };

          this.report = this.props.myReport as Report;
          this.pages = await this.report.getPages();
          this.visuals = await this.pages[1].getVisuals();


          for(const visual of this.visuals) {
              await visual.setFilters([filter]); //updateFilters also work

          }
        } catch (error) {
          console.log('Error --> ', error);
        }

      }

      async setSlicerStateBI(): Promise<void> {
        try {
          const filter: models.IBasicFilter = {
            $schema: "http://powerbi.com/product/schema#basic",
            displaySettings: {
              isHiddenInViewMode: false
            },
            target: {
                table: "COVID",
                column: "Date"
            },
            filterType: models.FilterType.Basic,
            operator: "In",
            values:["1/22/2020"]
          };

          this.report = this.props.myReport as Report;
          this.pages = await this.report.getPages();
          this.visuals = await this.pages[1].getVisuals();


          for(const visual of this.visuals) {
            if(visual.type === "slicer") {
              console.log('Found the slicer');
              await visual.setSlicerState({ filters: [filter] });
            }
          }
        } catch (error) {
          console.log('Error --> ', error);
        }
      }
}

export default Button;