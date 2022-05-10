import { Provenance, NodeID, initProvenance } from '@visdesignlab/trrack';
import { ProvVisCreator } from '@visdesignlab/trrack-vis';
import { Report } from 'powerbi-client';
import { IProvectories } from './interfaces';
import { applyBookmark } from './utils';
import { ActionReturnType } from '@visdesignlab/trrack/dist/Types/Action';

export interface IAction {
  event: (onDashboardClick: () => Promise<{ newState: IProvectories, label: string }>) => void;
}

interface IAppProvenance {
  provenance: Provenance<IProvectories, string, void>;
  actions: IAction;
}
/**
 * Initializes trrack and trrack-vis provenance
 * @param report Current report to apply bookmarks on
 * @param defaultState Initial state of the dashboard
 * @param bookmarkRef Current bookmarkRef to get the update bookmark for performance improvements
 */
export function setupProvenance(report: Report, defaultState: IProvectories, bookmarkRef: React.MutableRefObject<string>): IAppProvenance {
  const provenance = initProvenance<IProvectories, string, void>(defaultState as IProvectories);

  provenance.addGlobalObserver(() => {
    const currentNode = provenance.getState(provenance.current);
    if (bookmarkRef.current !== currentNode.bookmark) {
      applyBookmark(provenance.getState(provenance.current).bookmark, report);
      bookmarkRef.current = '';
    }
  });

  provenance.done();

  const event = async (onDashboardClick: () => Promise<{ newState: IProvectories, label: string }>) => {
    const { newState, label } = await onDashboardClick();
    provenance.apply({
      apply: (state: IProvectories) => ({
        state: newState as IProvectories,
        label,
        stateSaveMode: 'Complete',
        actionType: 'Regular',
        eventType: '',
        meta: {}
      } as ActionReturnType<IProvectories, string>)
    }, label);
  };

  const provVisUpdate = () => {
    const provDiv = document.getElementById("provDiv");
    if (provDiv) {
      ProvVisCreator(
        provDiv!,
        provenance,
        (id: NodeID) => provenance.goToNode(id),
        true, false, undefined, { height: 500, width: 150, textSize: 12, verticalSpace: 25 });
    }
  };

  provVisUpdate();

  return {
    provenance,
    actions: {
      event
    },
  };
}
