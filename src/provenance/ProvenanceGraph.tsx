import React from "react";
import { Report } from "report";
import { setupProvenance } from "./Provenance";
import { captureBookmark, exportData } from "./utils";
import { IVis, IFeatureVector } from "./interfaces";

export function ProvenanceGraph({ report }: { report: Report }) {
  const featureVector = React.useRef<IFeatureVector>({ time: 0, visuals: {} });
  const bookmark = React.useRef<string>('');
  const [reportLoaded, setReportLoaded] = React.useState<boolean>(false);

  const initFeatureVector = React.useCallback(async () => {
    const featVecVis = featureVector.current.visuals;
    const pages = await report.getPages();
    const vis = await pages[1].getVisuals();
    vis.filter((v) => v.type !== 'card' && v.type !== 'shape').forEach(async (v) => {
      if (!featVecVis || !featVecVis[v.name]) {
        featVecVis[v.name] = { visState: { selected: null, slicer: v.type === 'slicer' }, visDesc: {} };
      }
    });
  }, [featureVector, report]);

  const onEvent = React.useCallback((event: any) => {
    const { current } = featureVector;

    const visualInfo: { name: string, title: string, type: string } = event.detail.visual;
    const dataPoints: { identity: { target: { column: string, table: string }, equals: string }[] }[] = event.detail.dataPoints;
    let label = '';

    if (visualInfo.type !== 'slicer') {
      Object.keys(current.visuals).forEach((key) => {
        if (!current.visuals[key].visState.slicer) {
          current.visuals[key].visState.selected = null;
        }
      });
      label += 'Vis -';
    } else {
      label += 'Box -';
    }

    if (dataPoints.length > 0) {
      dataPoints[0].identity.forEach((i, idx) => {
        current.visuals[visualInfo.name].visState.selected = { ...current.visuals[visualInfo.name].visState.selected, [i.target.column]: i.equals };
        label += `${idx > 0 ? ';' : ''} ${i.target.column}: ${i.equals}`;
      });
    } else {
      label += ' deselected';
    }
  }, []);

  const getVisualState = React.useCallback(async (): Promise<void> => {
    const featVecVis = featureVector.current.visuals;
    const pages = await report.getPages();
    const vis = await pages[1].getVisuals();
    vis.filter((v) => v.type !== 'card' && v.type !== 'shape').forEach(async (v) => {
      const featVis = featVecVis[v.name].visDesc;
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
            featVis[key] = featVis[key]?.length > 0
              ? [Math.min(val as number, featVis[key][0] as number), Math.max(val as number, featVis[key][1] as number)]
              : [val, val];
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

    featureVector.current.visuals = featVecVis;
  }, [report, featureVector]);

  const setFeatureVector = React.useCallback(async (event?: any) => {
    await getVisualState();
    if (event) {
      await onEvent(event);
    }
  }, [getVisualState, onEvent]);

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
        await initFeatureVector();
        await getVisualState();
        featureVector.current.time = new Date().getTime();
        const actions = setupProvenance(report, { featureVector: featureVector.current, bookmark: bookmark.current }, bookmark).actions;

        report.on("dataSelected", async (event: any) => {
          await setFeatureVector(event);

          featureVector.current.time = new Date().getTime();
          console.log('Feature Vector', featureVector.current);
          // console.log('Data Selected', event.detail);

          const capturedBookmark = await captureBookmark(report);
          // console.log(capturedBookmark?.state)
          bookmark.current = capturedBookmark?.state || '';
          actions.event({ bookmark: bookmark.current, featureVector: featureVector.current }, 'hi');
        });
      };
      init();
    }
  }, [report, featureVector, reportLoaded, getVisualState]);

  return <div id="provDiv" style={{ width: 300, marginLeft: 5 }} />;
}
