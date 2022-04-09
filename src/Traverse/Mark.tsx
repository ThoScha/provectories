import Interaction from "./Interaction";
class Mark {

  public mark: string;
  public markControls: string[];
  public size: number; // Not required
  public color: string; //NA
  public opacity: string; //NA
  public interaction: Interaction;
  public isVisited: boolean;

  constructor() {

    this.mark = "";
    this.markControls = ["Hover", "Click"]; // Hard-coded
    this.size = 0;
    this.color = "";
    this.opacity = "";
    this.isVisited = false;
    this.interaction = new Interaction();
  }
}

export default Mark;