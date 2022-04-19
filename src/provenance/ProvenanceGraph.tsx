import React from "react";
import { Report } from "report";
import { setupProvenance } from "./Provenance";
import { IFeatureVector } from "./interfaces";
import { captureBookmark, exportData, getVisualAttributeMapper, toObjectKey, getCurrentVisuals } from "./utils";

export function ProvenanceGraph({ report }: { report: Report }) {
  const featureVector = React.useRef<IFeatureVector>({ time: 0, visuals: {} });
  const bookmark = React.useRef<string>('');

  React.useEffect(() => {
    const provectories = async () => {
      const initFeatureVector = async () => {
        const featVecVis = featureVector.current.visuals;
        const visuals = await getCurrentVisuals(report);
        visuals.forEach(async (v) => {
          const columnToAttributeMap = await getVisualAttributeMapper(v);
          const title = toObjectKey(v.title);
          if (featVecVis && !featVecVis[title]) {
            featVecVis[toObjectKey(title)] = { visDesc: { selected: null, type: v.type, columnToAttributeMap }, visState: {} };
          }
        });
      };

      const setVisSelected = (event: any): string => {
        const { dataPoints } = event.detail;
        const { type, title } = event.detail.visual;
        const { visuals } = featureVector.current;
        let label = title + ' - ';

        // clears non slicer values when non slicer selection
        if (type !== 'slicer') {
          Object.keys(visuals).forEach((key) => {
            const { visDesc } = visuals[key];
            visDesc.selected = visDesc.type !== 'slicer' ? null : visDesc.selected;
          });
        }
        // asign selected values
        if (dataPoints.length > 0) {
          const { visDesc } = visuals[toObjectKey(title)];
          dataPoints[0].identity.forEach((i: any, idx: number) => {
            visDesc.selected = { ...visDesc.selected, [i.target.column]: i.equals };
            label += `${idx > 0 ? '; ' : ''}${i.target.column}: ${i.equals}`;
          });
          return label;
        }
        return label + 'deselected';
      };

      const setVisDesc = async (): Promise<void> => {
        const featVecVis = featureVector.current.visuals;
        const visuals = await getCurrentVisuals(report);
        visuals.forEach(async (v) => {
          const result = await exportData(v);

          if (!result) {
            return;
          }
          // vectorize data string && remove last row (empty)
          const data = result.data.replaceAll("\n", "").split('\r').map((d) => d.split(',')).slice(0, -1);
          const groupedData: { [key: string]: Set<any> } = {};

          // group data columnwise
          data[0].forEach((header, index) => {
            const key = toObjectKey(header);
            groupedData[key] = new Set();
            const currSet = groupedData[key];

            data.forEach((row, idx) => {
              // skip headers and empty values
              if (idx === 0 || !row[index]) {
                return;
              }
              const cell = row[index];
              const number = cell.match(/\d+/);
              const value = number ? parseInt(number[0]) : cell;
              currSet.add(value);
            });
          });

          const currVis = featVecVis[toObjectKey(v.title)];
          currVis.visState = {};
          const featVis = currVis.visState;

          // assign to feature vector in right format
          Object.keys(groupedData).forEach((key) => {
            const currArr: (string | number)[] = Array.from(groupedData[key]);
            const attribute = currVis.visDesc.columnToAttributeMap[key];

            if (!featVis[attribute]) {
              featVis[attribute] = {}
            }
            featVis[attribute][key] = typeof currArr[0] === 'number' ?
              [Math.min(...(currArr as number[])), Math.max(...(currArr as number[]))] : currArr;
          });
        });
      };

      const setBookmark = async () => await captureBookmark(report).then((captured) => bookmark.current = captured?.state || '');
      const setCurrTime = () => featureVector.current.time = new Date().getTime();

      await initFeatureVector();
      await setVisDesc();
      await setBookmark();
      setCurrTime();

      const actions = setupProvenance(
        report,
        { featureVector: featureVector.current, bookmark: bookmark.current },
        bookmark
      ).actions;

      report.on("dataSelected", async (event: any) => {
        await setVisDesc();
        await setBookmark();
        const label = setVisSelected(event);
        setCurrTime();
        actions.event({ bookmark: bookmark.current, featureVector: featureVector.current }, label);
        console.log('Feature Vector', featureVector.current.visuals);
      });
    };

    // report functions can only be called when the report is loaded
    report.on('loaded', async () => {
      await provectories().then(() => report.off('loaded'));
    });

    // dashboard rerender doesn't change the report object
  }, [report]);

  return <div id="provDiv" style={{ width: 300, marginLeft: 5 }} />;
}
