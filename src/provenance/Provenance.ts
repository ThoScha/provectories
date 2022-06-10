import { Provenance, initProvenance } from '@visdesignlab/trrack';
import { IAppState } from '../utils/interfaces';
import { ActionReturnType } from '@visdesignlab/trrack/dist/Types/Action';

export interface IAction {
  event: (onDashboardClick: () => Promise<{ newState: IAppState, label: string }>) => void;
}

interface IAppProvenance {
  provenance: Provenance<IAppState, string, void>;
  actions: IAction;
}

/**
 * Initializes trrack and trrack-vis provenance
 * @param defaultState Initial state of the dashboard
 */
export function setupProvenance(defaultState: IAppState): IAppProvenance {
  const provenance = initProvenance<IAppState, string, void>(defaultState as IAppState);

  provenance.done();

  const event = async (onDashboardClick: () => Promise<{ newState: IAppState, label: string }>) => {
    const { newState, label } = await onDashboardClick();
    provenance.apply({
      apply: (state: IAppState) => ({
        state: newState as IAppState,
        label,
        stateSaveMode: 'Complete',
        actionType: 'Regular',
        eventType: '',
        meta: {}
      } as ActionReturnType<IAppState, string>)
    }, label);
  };

  return {
    provenance,
    actions: {
      event
    },
  };
}
