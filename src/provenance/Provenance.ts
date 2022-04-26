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

export function setupProvenance(report: Report, defaultState: IProvectories, bookmarkRef: React.MutableRefObject<string>): IAppProvenance {
  const rootState = defaultState.appState;
  const provenance: Provenance<IProvectories, string, unknown> = initProvenance<IProvectories, string, unknown>(defaultState);

  provenance.addGlobalObserver(() => {
    const currentNode = provenance.getState(provenance.current);
    if (bookmarkRef.current !== currentNode.bookmark) {
      applyBookmark(provenance.getState(provenance.current).bookmark, report);
      bookmarkRef.current = '';
    }
  });

  provenance.done();

  const appStateToFeatureVector = (currState: IAppState): IFeatureVector => {
    const featureVector: IFeatureVector = { time: currState.time };
    const rootVisuals = rootState.visuals

    Object.keys(rootVisuals).forEach((vKey) => {
      const { visState, selected, type } = currState.visuals[vKey];
      const rootVisState = rootVisuals[vKey].visState;
      Object.keys(rootVisState).forEach((aKey) => {
        const rootAttribute = rootVisState[aKey];
        const currAttribute = visState[aKey];
        featureVector[vKey + aKey] = typeof rootAttribute[0] === 'number' ? (
          currAttribute as number[] || [0, 0]
        ) : (
            rootAttribute.map((root) => [
              currAttribute.includes(root) ? 0 : 1, // if filtered then 1 (included = !filtered)
              selected && selected[aKey] === root ? 1 : 0 // if selected 1
            ])
          );
      });
    });
    return featureVector;
  }

  const event = (newState: IProvectories, label: string) => {
    console.log(appStateToFeatureVector(newState.appState));

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
