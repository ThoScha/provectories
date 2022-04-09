import { FilterType, IFilterGeneralTarget } from "powerbi-models";
class Interaction {

  public hover: boolean;
  public click: boolean;
  public brush: boolean;
  public targets: IFilterGeneralTarget[];
  public filterType: FilterType[];

  constructor() {
    this.hover = false;
    this.click = false;
    this.brush = false;
    this.targets = [];
    this.filterType = [];
  }
}

export default Interaction;