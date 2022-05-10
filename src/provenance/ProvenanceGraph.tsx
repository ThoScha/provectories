import React from "react";
import { Report } from "report";
import { setupProvenance } from "./Provenance";
import { IProvectories, IAppState } from "./interfaces";
import { captureBookmark, exportData, toCamelCaseString, getCurrentVisuals, makeDeepCopy, downloadGraphAsFeatVecCsv } from "./utils";
import { Provenance } from "@visdesignlab/trrack";

export function ProvenanceGraph({ report }: { report: Report }) {
  const appStateRef = React.useRef<IAppState>({});
  const bookmarkRef = React.useRef<string>('');
  const provenanceRef = React.useRef<Provenance<IProvectories, string, void>>();

  React.useEffect(() => {
    /**
     * Initialize appStateRef
     * Only possible if report is loaded
     */
    const initAppState = async () => {
      const visuals = await getCurrentVisuals(report);
      visuals.forEach((v) => {
        const title = toCamelCaseString(v.title);
        if (appStateRef.current && !appStateRef.current[title]) {
          appStateRef.current[toCamelCaseString(title)] = { selected: null, type: v.type, visState: {} };
        }
      });
    };

    /**
     * Sets the selected attribute of given visuals extracted from the click-event
     * Only possible if report is loaded
     * @param event click-event from dashboard eventlistener
     */
    const setVisSelected = (event: any): string => {
      const { dataPoints } = event.detail;
      const { type, title } = event.detail.visual;
      const visuals = appStateRef.current;
      let label = title + ' - ';

      // clears non slicer values when non slicer selection
      if (type !== 'slicer') {
        Object.keys(visuals).forEach((key) => {
          const visDesc = visuals[key];
          visDesc.selected = visDesc.type !== 'slicer' ? null : visDesc.selected;
        });
      }
      // asign selected values
      if (dataPoints.length > 0) {
        const visDesc = visuals[toCamelCaseString(title)];
        dataPoints[0].identity.forEach((i: any, idx: number) => {
          visDesc.selected = { ...visDesc.selected, [i.target.column]: i.equals };
          label += `${idx > 0 ? '; ' : ''}${i.target.column}: ${i.equals}`;
        });
        return label;
      }
      return label + 'deselected';
    };

    /**
     * Sets the current state of all visuals of the dashboard on given appState
     * Only possible if report is loaded
     * @param appState appState object of which the visuals should be set
     * @param report to extract the current visuals state
     */
    const setVisState = async (appState: IAppState, report: Report): Promise<IAppState> => {
      const visuals = await getCurrentVisuals(report);
      await Promise.all(visuals.map(async (v) => {
        const result = await exportData(v);

        if (!result) {
          return;
        }
        // vectorize data string && remove last row (empty)
        const data = result.data.replaceAll("\n", "").split('\r').map((d) => d.split(',')).slice(0, -1);
        const groupedData: { [key: string]: Set<any> } = {};

        // group data columnwise
        data[0].forEach((header, index) => {
          const key = toCamelCaseString(header);
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

        const { visState } = appState[toCamelCaseString(v.title)];
        // assign to visual state in right format
        Object.keys(groupedData).forEach((key) => {
          const currArr: (string | number)[] = Array.from(groupedData[key]);
          visState[key] = typeof currArr[0] === 'number' ?
            [Math.min(...(currArr as number[]), 0), Math.max(...(currArr as number[]), 0)] : currArr;
        });
      }));
      return appState;
    };

    /**
     * Captures bookmark of the current dashboard state, sets it in the bookmarkRef and returns bookmark
     * Only possible if report is loaded
     */
    const setBookmark = async (): Promise<string> => {
      return await captureBookmark(report).then((captured) => {
        const bookmark = captured?.state || '';
        bookmarkRef.current = bookmark;
        return bookmark;
      });
    };

    /**
     * initializes provenance, click-event handler and the appState
     */
    const provectories = async () => {
      await initAppState();
      const appState = await setVisState(appStateRef.current, report);
      const bookmark = await setBookmark();
      const { actions, provenance } = setupProvenance(
        report, { appState, bookmark }, bookmarkRef
      );
      provenanceRef.current = provenance;

      report.on("dataSelected", async (event: any) => {
        const label = setVisSelected(event);
        const bookmark = await setBookmark();

        // function call is done in provenance for better performance on the dashboard
        const onDashboardClick = async () => {
          const appState = await setVisState(makeDeepCopy(appStateRef.current), report);
          console.log(appState);
          return { newState: { bookmark, appState }, label };
        };

        actions.event(onDashboardClick);
      });
    };

    // report functions can only be called when the report is loaded
    report.on('loaded', async () => {
      await provectories().then(() => report.off('loaded'));
    });
    // dashboard rerender doesn't change the report object
  }, [report]);

  return <div>
    <div id="provDiv" style={{ width: 300, marginLeft: 5 }} />
    <button
      className="ui button"
      style={{ float: 'right', marginRight: 0, marginTop: 2 }}
      onClick={() => provenanceRef.current ? downloadGraphAsFeatVecCsv(provenanceRef.current) : null}
    >
      Download
    </button>
  </div>;
}
