import React from "react";
import { Report } from "report";
import { setupProvenance } from "./Provenance";
import { IFeatureVector } from "./interfaces";
import { captureBookmark, exportData, getVisualAttributeMapper, toTitle } from "./utils";

export function ProvenanceGraph({ report }: { report: Report }) {
  const featureVector = React.useRef<IFeatureVector>({ time: 0, visuals: {} });
  const bookmark = React.useRef<string>('');

  React.useEffect(() => {
    const provectories = async () => {
      const initFeatureVector = async () => {
        const featVecVis = featureVector.current.visuals;
        const pages = await report.getPages();
        const vis = await pages[1].getVisuals();
        vis.filter((v) => v.type !== 'card' && v.type !== 'shape').forEach(async (v) => {
          const columnToAttributeMap = await getVisualAttributeMapper(v);
          const title = toTitle(v.title);
          if (featVecVis && !featVecVis[title]) {
            featVecVis[toTitle(title)] = { visDesc: { selected: null, type: v.type, columnToAttributeMap }, visState: {} };
          }
        });
      };

      const setVisSelected = (event: any): string => {
        const visualInfo: { name: string, title: string, type: string } = event.detail.visual;
        const title = toTitle(visualInfo.title);
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
            visuals[title].visDesc.selected = {
              ...visuals[title].visDesc.selected,
              [i.target.column]: i.equals
            };
            label += `${idx > 0 ? ';' : ''} ${i.target.column}: ${i.equals}`;
          });
        } else {
          label += ' deselected';
        }

        return label;
      };

      const setVisDesc = async (): Promise<void> => {
        const featVecVis = featureVector.current.visuals;
        const pages = await report.getPages();
        const vis = await pages[1].getVisuals();
        Promise.all(vis.filter((v) => v.type !== 'card' && v.type !== 'shape').map(async (v) => {
          const result = await exportData(v);

          if (!result) {
            return;
          }

          const title = toTitle(v.title);
          const mapper = featVecVis[title].visDesc.columnToAttributeMap;
          featVecVis[title].visState = {};
          const featVis = featVecVis[title].visState;

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
            // skip headers
            if (idx === 0) {
              return;
            }

            // add values of each row in the right object value
            data[0].forEach((key, idx) => {
              if (!d[idx]) {
                return;
              }

              const mappedKey = mapper[key];

              //intialize attribute if empty
              if (!featVis[mappedKey]) {
                featVis[mappedKey] = {};
              }
              const attribute = featVis[mappedKey][key];

              //intialize attributeValue if empty
              if (!attribute[key]) {
                attribute[key] = []
              }

              const attributeValues = attribute[key];

              const numbers = d[idx]?.match(/\d+/);
              const val = numbers ? parseInt(numbers[0]) : d[idx];

              if (numbers) {
                attributeValues.push(
                  attributeValues?.length > 0 ?
                    [
                      Math.min(val as number, attributeValues[0] as number),
                      Math.max(val as number, attributeValues[1] as number)
                    ] :
                    [val, val]
                );
              } else {
                attributeValues.push(val);
              }
            });
          });

          data[0].forEach((key) => { // remove duplicates
            if (featVis[mapper[key]][key] && typeof featVis[mapper[key]][key][0] === 'string') {
              featVis[mapper[key]][key] = Array.from(new Set<string>(featVis[mapper[key]][key] as string[]));
            }
          });
        }));
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
