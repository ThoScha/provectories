import { Provenance, NodeID, initProvenance } from '@visdesignlab/trrack';
import { ProvVisCreator } from '@visdesignlab/trrack-vis';
import { Report } from 'powerbi-client';
import { IApplicationState } from './interfaces';
import { applyBookmark } from './utils';
import { ActionReturnType } from '@visdesignlab/trrack/dist/Types/Action';

export interface IAction {
  event: (newState: IApplicationState, label: string) => void;
}

interface IAppProvenance {
  provenance: Provenance<IApplicationState, string, unknown>;
  actions: IAction;
}

export function setupProvenance(report: Report, defaultState: IApplicationState, bookmark: React.MutableRefObject<string>): IAppProvenance {
  const provenance: Provenance<IApplicationState, string, unknown> = initProvenance<IApplicationState, string, unknown>(defaultState);

  provenance.addGlobalObserver(() => {
    const currentNode = provenance.getState(provenance.current);
    if (bookmark.current !== currentNode.bookmark) {
      applyBookmark(provenance.getState(provenance.current).bookmark, report, () => true);
      bookmark.current = '';
    }
  });

  provenance.done();

  const event = (newState: IApplicationState, label: string) => {
    provenance.apply({
      apply: (state: IApplicationState) => ({
        state: newState,
        label,
        stateSaveMode: 'Complete',
        actionType: 'Regular',
        eventType: '', // TODO: changes here because graph = string
        meta: {}
      } as ActionReturnType<IApplicationState, string>)
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
