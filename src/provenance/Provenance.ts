import { Provenance, NodeID, initProvenance } from '@visdesignlab/trrack';
import { ProvVisCreator } from '@visdesignlab/trrack-vis';
import { Report } from 'powerbi-client';
import { IProvectories, IFeatureVector, IAppState } from './interfaces';
import { applyBookmark } from './utils';
import { ActionReturnType } from '@visdesignlab/trrack/dist/Types/Action';

export interface IAction {
  event: (newState: IProvectories, label: string) => void;
}

interface IAppProvenance {
  provenance: Provenance<IProvectories, string, unknown>;
  actions: IAction;
}

export function setupProvenance(report: Report, defaultState: IProvectories, bookmark: React.MutableRefObject<string>): IAppProvenance {
  const provenance: Provenance<IProvectories, string, unknown> = initProvenance<IProvectories, string, unknown>(defaultState);

  provenance.addGlobalObserver(() => {
    const currentNode = provenance.getState(provenance.current);
    if (bookmark.current !== currentNode.bookmark) {
      applyBookmark(provenance.getState(provenance.current).bookmark, report);
      bookmark.current = '';
    }
  });

  provenance.done();

  const appStateToFeatureVector = (appState: IAppState, nodeState: IAppState): IFeatureVector => {
    const featureVector: IFeatureVector = [['time'], [appState.time]];
    console.log("appState", appState.visuals)
    console.log("nodeState", nodeState.visuals);
    const visuals = appState.visuals;
    Object.keys(visuals).forEach((vKey) => {
      const visual = visuals[vKey];
      const selected = visual.visDesc.selected;
      const state = visuals[vKey].visState;
      Object.keys(state).forEach((sKey) => {
        const attribute = state[sKey];
        Object.keys(attribute).forEach((aKey) => {
          const test = attribute[aKey];
          featureVector[0].push(vKey + aKey);
          if (typeof test[0] === 'number') {
            featureVector[1].push(test as number[]);
          } else {
            const newStuff = [];
            console.log(nodeState.visuals[vKey])
            console.log(vKey, aKey, sKey)
            nodeState.visuals[vKey].visState[sKey][aKey].forEach((prev: string | number) => {
              newStuff.push(test.includes(prev) ? 0 : 1) // if filtered then 1 (included = !filtered)
              newStuff.push(selected && selected[aKey] === prev ? 1 : 0) // if selected 1
            });
          }
        });
      });
    });

    return featureVector;
  }

  const event = (newState: IProvectories, label: string) => {
    console.log(appStateToFeatureVector(newState.appState, provenance.getState(provenance.root).appState));

    provenance.apply({
      apply: (state: IProvectories) => ({
        state: newState,
        label,
        stateSaveMode: 'Complete',
        actionType: 'Regular',
        eventType: '', // TODO: changes here because graph = string
        meta: {}
      } as ActionReturnType<IProvectories, string>)
    }, label);
  }

  const provVisUpdate = () => {
    const provDiv = document.getElementById("provDiv");
    if (provDiv) {
      ProvVisCreator(
        provDiv!,
        provenance,
        (id: NodeID) => provenance.goToNode(id),
        true, false, undefined, { height: 500, width: 150, textSize: 12, verticalSpace: 25 });
    }
  }

  provVisUpdate();

  return {
    provenance,
    actions: {
      event
    },
  };
}
