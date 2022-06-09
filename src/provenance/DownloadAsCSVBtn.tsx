import React from "react";
import { IProvectories, IAppState, IFeatureVector, IExportFeatureVectorRow } from "./interfaces";
import { Provenance } from "@visdesignlab/trrack";
import { provenance } from "./Provectories";
import { Report } from "powerbi-client";
import { USER } from "..";
import { timeout } from "d3";

export function DownloadAsCSVBtn({ report }: { report: Report }) {
  const [prov, setProv] = React.useState<Provenance<IProvectories, string, void> | null>(null);
  const [downloaded, setDownloaded] = React.useState<boolean>(false);

  /*
    Provectories.provenance is an uncontrolled, empty object in the beginning
    When the report is loaded and rendered Provectories.provenance isn't empty anymore
    Set prov with Provectories.provenance when report is rerendered the first time to get an complete object and trigger a rerender for the JSX
  */
  report.off('rendered');
  report.on('rendered', () => {
    if (provenance?.root && !prov?.root) {
      setProv(provenance);
      report.off('rendered');
    }
  });

  /**
  * Takes an appState and encodes it as a feature vector. Needs initial app state to know if an attribute is filtered
  * @param currState State to encode as a feature vector
  * @param rootState Initial app state
  */
  function appStateToFeatureVector(currState: IAppState, rootState: IAppState): IFeatureVector {
    const featureVector: IFeatureVector = {};
    const selectedColumns = new Set<string>();
    const filteredColumns = new Set<string>();
    Object.keys(rootState).forEach((vKey) => {
      const { visState, selected, type } = currState[vKey];
      const rootVisState = rootState[vKey].visState;
      Object.keys(rootVisState).forEach((aKey) => {
        const rootAttribute = rootVisState[aKey];
        const currAttribute = visState[aKey];
        let columnTitle = vKey + '.' + aKey;
        const vector = [] as number[];
        // number arrays will be used as they are
        if (typeof rootAttribute[0] === 'number') {
          columnTitle += "[numerical]";
          vector.push(...(currAttribute.length > 0 ? currAttribute as number[] : [0]));
        } else { // string arrays will be encoded
          columnTitle += "[categorical]";
          (rootAttribute as string[]).forEach((root) => {
            if (selected && selected[aKey]?.includes(root)) {// if selected 1 : 0
              vector.push(1);
              selectedColumns.add(columnTitle);
            } else {
              vector.push(0)
            }
            if (type !== 'slicer') { // slicers can't be filtered
              if ((currAttribute as string[]).includes(root)) { // if filtered then 1 (included = !filtered)
                vector.push(0);
              } else {
                vector.push(1);
                filteredColumns.add(columnTitle);
              }
            }
          });
        }
        featureVector[columnTitle] = vector;
      });
    });

    return { selectedValues: Array.from(selectedColumns).join(", ") || "", filteredValues: Array.from(filteredColumns).join(", ") || "", ...featureVector };
  };

  /**
   * Goes through graph, returns feature vector row for each node and returns feature vector matrix
   * @param provenance Provenance object to featurize
   */
  const featureVectorizeGraph = (provenance: Provenance<IProvectories, string, void>): IExportFeatureVectorRow[] => {
    const { root, graph } = provenance;
    const featureVectors: IExportFeatureVectorRow[] = [];

    Object.keys(graph.nodes).forEach((key) => {
      const currNode = graph.nodes[key];
      const currVector = appStateToFeatureVector(
        provenance.getState(currNode.id).appState, provenance.getState(root.id).appState
      );
      // adding header row
      if (key === root.id) {
        featureVectors.push(['timestamp', 'user', 'triggeredAction', ...Object.keys(currVector)]);
      }
      const newRow: IExportFeatureVectorRow = [currNode.metadata.createdOn || -1, USER, currNode.label];
      // skip first column since time is no key in feature vector
      (featureVectors[0] as string[]).slice(3).forEach((title) => newRow.push(currVector[title] ? currVector[title] : ""));
      featureVectors.push(newRow);
    });
    return featureVectors;
  };

  /**
   * Takes feature vector matrix and converts it to a csv-string
   * @param exportFeatureVectorRows Feature vector matrix
   */
  const featureVectorsToCsvString = (exportFeatureVectorRows: IExportFeatureVectorRow[]): string => {
    let csvString = 'data:text/csv;charset=utf-8,';
    exportFeatureVectorRows.forEach((row, idx) => {
      if (idx === 0) {
        csvString += row.join(';') + '\r\n';
      } else {
        (row as IExportFeatureVectorRow).forEach((cell, i) => {
          let newString = typeof cell === "string" ? cell : JSON.stringify(cell);
          // removes brackets
          newString = newString.replaceAll('[', '').replaceAll(']', '');
          csvString += newString;
          csvString += i < row.length - 1 ? ';' : '\r\n'
        });
      }
    });
    return csvString;
  };

  // /**
  //  * Returns csv file representing feature vectors of a provenance graph
  //  * @param provenance Provenance object to convert to csv
  //  */
  const downloadGraphAsFeatVecCsv = (provenance: Provenance<IProvectories, string, void>): void => {
    // timeout to await unfinished async calls
    timeout(() => {
      const uri = encodeURI(featureVectorsToCsvString(featureVectorizeGraph(provenance)))
      const anchor = document.createElement('a');
      anchor.style.display = 'none';
      if ("download" in anchor) {
        anchor.download = `provectories-${USER}-${new Date().getTime()}.csv`;
        anchor.href = uri;
        anchor.click();
      } else {
        window.open(uri, '_self');
      }
      anchor.remove();
      setDownloaded(true);
    }, 1500);
  };

  return <div>
    {prov ?
      <div>
        <button className="btn btn-secondary" type="button" onClick={() => downloadGraphAsFeatVecCsv(prov)}>
          Download as CSV
        </button>
      </div> : null}
  </div>;
}
