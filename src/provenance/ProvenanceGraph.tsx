import React from "react";
import { Report } from "report";
import { setupProvenance } from "./Provenance";
import { IFeatureVector } from "./interfaces";
import { captureBookmark, exportData, getVisualAttributeMapper, toObjectKey } from "./utils";

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
          const title = toObjectKey(v.title);
          if (featVecVis && !featVecVis[title]) {
            featVecVis[toObjectKey(title)] = { visDesc: { selected: null, type: v.type, columnToAttributeMap }, visState: {} };
          }
        });
      };

      const setVisSelected = (event: any): string => {
        const visualInfo: { name: string, title: string, type: string } = event.detail.visual;
        const title = toObjectKey(visualInfo.title);
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

        vis.filter((v) => v.type !== 'card' && v.type !== 'shape').forEach(async (v) => {
          const result = await exportData(v);

          if (!result) {
            return;
          }

          const title = toObjectKey(v.title);
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

          // make array per row and push into sets rowwise (sort(), first and last is min-max)

          // remove space in headers to get valid object keys
          data[0] = data[0].map((d) => toObjectKey(d));

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
              const attribute = featVis[mappedKey];

              //intialize attributeValue if empty
              if (!attribute[key]) {
                attribute[key] = []
              }

              let attributeValues = attribute[key];

              const number = d[idx]?.match(/\d+/);
              const val = number ? parseInt(number[0]) : d[idx];

              if (number) {
                if (attributeValues?.length > 0) {
                  attribute[key] = [
                    Math.min(val as number, attributeValues[0] as number),
                    Math.max(val as number, attributeValues[1] as number)
                  ];
                } else {
                  attribute[key] = [val, val];
                }
              } else {
                attributeValues.push(val);
              }
            });
          });

          // removes duplicates from string[]
          Object.keys(featVis).forEach((key) => {
            const attribute = featVis[key];
            Object.keys(attribute).forEach((k) => {
              const values = attribute[k];
              if (typeof values[0] === 'string') {
                attribute[k] = Array.from(new Set<string>(values as string[]));
              }
            });
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
