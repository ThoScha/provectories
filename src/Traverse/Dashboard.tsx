import Visual from './Visual';
class Dashboard {
  private visuals: Visual[];
  private domain: string;
  private isVisited: boolean;

  constructor(visuals: Visual[], domain: string) {
    this.visuals = visuals;
    this.domain = domain;
    this.isVisited = false;
  }

  showDashboardValues(): void {

    console.log("Domain: ", this.domain);
    for(const visual of this.visuals) {
      console.log("Title: ", visual.title);
      console.log("Type: ", visual.type);
      console.log("Axis: ", visual.axis);
      console.log("Insight: ", visual.insight);
      console.log("Mark: ", visual.mark);
      console.log('----------------------------------------------------');
    }
  }
}

export default Dashboard;