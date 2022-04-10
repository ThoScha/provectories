import React from "react";
import { Report } from "report";
import { setupProvenance } from "./Provenance";
import { captureBookmark, exportData } from "./utils";
import { IFeatureVector } from "./interfaces";

export function ProvenanceGraph({ report }: { report: Report }) {
  const featureVector = React.useRef<IFeatureVector>({ time: 0, visuals: {} });
  const bookmark = React.useRef<string>('');
  const [reportLoaded, setReportLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {// report functions can only be called when the report is loaded
    report.on("loaded", async () => setReportLoaded(true));
    // dashboard rerender doesn't change the report object
  }, [report]);

  React.useEffect(() => {
    if (reportLoaded) {

      const initFeatureVector = async () => {
        const featVecVis = featureVector.current.visuals;
        const pages = await report.getPages();
        const vis = await pages[1].getVisuals();
        vis.filter((v) => v.type !== 'card' && v.type !== 'shape').forEach(async (v) => {
          if (!featVecVis || !featVecVis[v.name]) {
            featVecVis[v.name] = { visDesc: { selected: null, type: v.type }, visState: {} };
          }
        });
      };

      const onEvent = (event: any): string => {
        const visualInfo: { name: string, title: string, type: string } = event.detail.visual;
        const dataPoints: {
          identity: { target: { column: string, table: string }, equals: string }[]
        }[] = event.detail.dataPoints;
        const { visuals } = featureVector.current;
        let label = '';

        if (visualInfo.type !== 'slicer') {
          Object.keys(visuals).forEach((key) => {
            if (visuals[key].visDesc.type !== 'slicer') {
              visuals[key].visDesc.selected = null;
            }
          });
          label += 'Vis -';
        } else {
          label += 'Box -';
        }

        if (dataPoints.length > 0) {
          dataPoints[0].identity.forEach((i, idx) => {
            visuals[visualInfo.name].visDesc.selected = {
              ...visuals[visualInfo.name].visDesc.selected,
              [i.target.column]: i.equals
            };
            label += `${idx > 0 ? ';' : ''} ${i.target.column}: ${i.equals}`;
          });
        } else {
          label += ' deselected';
        }

        return label;
      };

      const getVisDesc = async (): Promise<void> => {
        const featVecVis = featureVector.current.visuals;
        const pages = await report.getPages();
        const vis = await pages[1].getVisuals();
        vis.filter((v) => v.type !== 'card' && v.type !== 'shape').forEach(async (v) => {
          featVecVis[v.name].visState = {};
          const featVis = featVecVis[v.name].visState;
          const result = await exportData(v);

          if (!result) {
            return;
          }

          // vectorize data string
          const data = result.data
            .replaceAll("\n", "")
            .split('\r')
            .map((d) => d.split(','))
            // remove last row (empty)
            .slice(0, -1);

          // remove space in headers to get valid object keys
          data[0] = data[0].map((d) => d.replaceAll(" ", ""));

          // fill object
          data.forEach((d, idx) => {
            if (idx === 0) { // skip headers
              return;
            }
            data[0].forEach((key, idx) => { // add values of each row in the right object value
              if (!d[idx]) {
                return;
              }
              const numbers = d[idx]?.match(/\d+/);
              const val = numbers ? parseInt(numbers[0]) : d[idx];
              if (numbers) {
                featVis[key] = featVis[key]?.length > 0 ?
                  [
                    Math.min(val as number, featVis[key][0] as number),
                    Math.max(val as number, featVis[key][1] as number)
                  ] :
                  [val, val];
              } else {
                if (featVis[key]) {
                  featVis[key].push(val);
                } else {
                  featVis[key] = [val];
                }
              }
            });
          });

          data[0].forEach((key) => { // remove duplicates
            if (featVis[key] && typeof featVis[key][0] === 'string') {
              featVis[key] = Array.from(new Set<string>(featVis[key] as string[]));
            }
          });
        });
      };

      const setCurrTime = () => featureVector.current.time = new Date().getTime();

      const init = async () => {
        await initFeatureVector();
        await getVisDesc();
        await captureBookmark(report).then((captured) => bookmark.current = captured?.state || '');
        setCurrTime();
        const actions = setupProvenance(
          report,
          { featureVector: featureVector.current, bookmark: bookmark.current },
          bookmark
        ).actions;

        report.on("dataSelected", async (event: any) => {
          const start = new Date().getTime();
          await getVisDesc();
          await captureBookmark(report).then((captured) => bookmark.current = captured?.state || '');
          const label = onEvent(event);
          setCurrTime();
          console.log('Feature Vector', featureVector.current.visuals);
          // console.log('Data Selected', event.detail);
          // console.log(capturedBookmark?.state)
          actions.event({ bookmark: bookmark.current, featureVector: featureVector.current }, label);
          const end = new Date().getTime();
          console.log('time:', end - start);
        });
      };
      init();
    }
  }, [report, featureVector, reportLoaded]);

  return <div id="provDiv" style={{ width: 300, marginLeft: 5 }} />;
}
