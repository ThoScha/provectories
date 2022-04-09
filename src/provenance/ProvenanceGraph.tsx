import React from "react";
import { Report } from "report";
import { setupProvenance } from "./Provenance";
import { captureBookmark, exportData, makeDeepCopy } from "./utils";
import { IFeatureVector, IVisualsState, IParametersState, ISlicersState, defaultClusterBarChart, defaultClusteredColumnChart, defaultLineChart } from "./interfaces";

const defaultParams: IParametersState = {
  Month: '',
  FPDesc: '',
  Region: '',
  Ethnicity: ''
};

const defaultSlicers: ISlicersState = {
  Region: '',
  Ethnicity: ''
};

export function ProvenanceGraph({ report }: { report: Report }) {
  const featureVector = React.useRef<IFeatureVector>({} as IFeatureVector);
  const bookmark = React.useRef<string>('');
  const [reportLoaded, setReportLoaded] = React.useState<boolean>(false);

  const getVisualState = React.useCallback(async (): Promise<IVisualsState> => {
    const pages = await report.getPages();
    const vis = await pages[1].getVisuals();
    const visuals = vis.filter((v) => v.type !== 'slicer' && v.type !== 'card' && v.type !== 'shape');
    const visualState: IVisualsState = {
      clusteredBarChart: makeDeepCopy(defaultClusterBarChart),
      clusteredColumnChart: makeDeepCopy(defaultClusteredColumnChart),
      lineChart: makeDeepCopy(defaultLineChart)
    };

    visuals.forEach(async (v) => {
      const result = await exportData(v);

      if (!result) {
        return;
      }
      
      // vectorize data string
      const data = result.data.replaceAll("\n", "").split('\r').map((d) => d.split(',')).slice(0, -1);
      // remove space in headers to get a valid object key
      data[0] = data[0].map((d) => d.replaceAll(" ", ""));
      
      const vState = visualState[v.type];

      data.forEach((d, idx) => {
        if (idx === 0) { // skip headers
          return;
        }
        data[0].forEach((key, idx) => { // add values of each row in the right object value
          if (!d[idx] || !(key in vState)) {
            return;
          }
          const numbers = d[idx]?.match(/\d+/);
          const val = numbers ? parseInt(numbers[0]) : d[idx];
          if (numbers) {
            vState[key] = vState[key]?.length > 0 
            ? [Math.min(val as number, vState[key][0]), Math.max(val as number, vState[key][1])] 
            : [val, val];
          } else {
            vState[key].push(val);
          }
        });
      });

      data[0].forEach((key) => { // TODO: make stuff generic
        if (vState[key] && typeof vState[key][0] === 'string') {
          vState[key] = Array.from(new Set<string>(vState[key]));
        }
      });
    });
    return visualState;
  }, [report]);

  React.useEffect(() => {
    // bookmarks can only be captured, when reports are loaded
    report.on("loaded", async () => {
      captureBookmark(report).then((captured) => {
        bookmark.current = captured?.state || '';
        setReportLoaded(true);
      });
    });
    // report object stays the same throught the work process - a rerender doesn't change the object
  }, [report]);

  React.useEffect(() => { // pass visuals as a ref and recalculate on event
    if (reportLoaded) {
      const init = async () => {
        featureVector.current = { time: new Date().getTime(), visuals: await getVisualState(), parameters: defaultParams, slicers: defaultSlicers };
        const actions = setupProvenance(report, { featureVector: featureVector.current, bookmark: bookmark.current }, bookmark).actions;

        report.on("dataSelected", async (event: any) => {
          const visualInfo: { name: string, title: string, type: string } = event.detail.visual;
          const dataPoints: { identity: { target: { column: string, table: string }, equals: string }[] }[] = event.detail.dataPoints;
          const { current } = featureVector;
          let label = '';

          if (visualInfo.type === 'slicer') {
            current.slicers[visualInfo.title] = dataPoints.length > 0 ? dataPoints[0].identity[0].equals : '';
            label += `Box - ${visualInfo.title}: ${dataPoints.length > 0 ? dataPoints[0].identity[0].equals : 'deselected'}`
          } else {
            current.parameters = { ...defaultParams };
            label += 'Vis -';
            if (dataPoints.length > 0) {
              dataPoints[0].identity.forEach((i, idx) => {
                current.parameters[i.target.column] = i.equals;
                label += `${idx > 0 ? ';' : ''} ${i.target.column}: ${i.equals}`;
              });
            } else {
              label += ' all deselected';
            }
          }

          featureVector.current.time = new Date().getTime();
          featureVector.current.visuals = await getVisualState();
          console.log('Feature Vector', featureVector.current);
          // console.log('Data Selected', event.detail);

          const capturedBookmark = await captureBookmark(report);
          // console.log(capturedBookmark?.state)
          bookmark.current = capturedBookmark?.state || '';
          actions.event({ bookmark: bookmark.current, featureVector: featureVector.current }, label);
        });
      };
      init();
    }
  }, [report, featureVector, reportLoaded, getVisualState]);

  return <div id="provDiv" style={{ width: 300, marginLeft: 5 }} />;
}
