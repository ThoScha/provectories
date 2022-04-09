import Mark from "./Mark";
import Axis from "./Axis";
import Insight from "./Insight";
class Visual {
  public title: string;
  public type: string;
  public mark: Mark;
  public axis: Axis;
  public insight: Insight;


   constructor(title?: string, type?: string, axis?: Axis, insight?: Insight, mark?: Mark) {
     this.title = title ?? "";
     this.type = type ?? "";
     this.mark = mark ?? new Mark() ;
     this.axis = axis ?? new Axis() ;
     this.insight = insight ?? new Insight();
   }
}

export default Visual;