import React from "react";
import { IProvectories, IAppState, IFeatureVector, IExportFeatureVectorRow } from "./interfaces";
import { Provenance } from "@visdesignlab/trrack";
import { provenance } from "./Provectories";
import { Report } from "powerbi-client";
import { USER } from "..";

export function DownloadAsCSVBtn({ report, forceUpdate }: { report: Report; forceUpdate: () => void }) {
  const [prov, setProv] = React.useState<Provenance<IProvectories, string, void> | null>(null);

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
    Object.keys(rootState).forEach((vKey) => {
      const { visState, selected, type } = currState[vKey];
      const rootVisState = rootState[vKey].visState;
      Object.keys(rootVisState).forEach((aKey) => {
        const rootAttribute = rootVisState[aKey];
        const currAttribute = visState[aKey];
        const vector = (featureVector[vKey + '.' + aKey] = []) as number[];
        // number arrays will be used as they are
        if (typeof rootAttribute === 'number') {
          vector.push((currAttribute as number) / rootAttribute);
        } else { // string arrays will be encoded
          rootAttribute.forEach((root) => {
            vector.push(selected && selected[aKey] === root ? 1 : 0); // if selected 1
            if (type !== 'slicer') { // slicers can't be filtered
              vector.push((currAttribute as string[]).includes(root) ? 0 : 1); // if filtered then 1 (included = !filtered)
            }
          });
        }
      });
    });
    return featureVector;
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
        featureVectors.push(['time', 'user', 'label', ...Object.keys(currVector)]);
      }
      const newRow: IExportFeatureVectorRow = [currNode.metadata.createdOn || -1, USER, currNode.label];
      // skip first column since time is no key in feature vector
      (featureVectors[0] as string[]).forEach((title) => currVector[title] ? newRow.push(currVector[title]) : null);
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
  };

  return <div style={{ marginLeft: 'auto' }}>
    {prov ?
      <div style={{ marginRight: 0 }}>
        <button type="button" className="ui button" onClick={() => forceUpdate()}>
          Reset provenance
        </button>
        <button className="ui button" type="button" onClick={() => downloadGraphAsFeatVecCsv(prov)}>
          Download as CSV
        </button>
      </div> : null}
  </div>;
}
