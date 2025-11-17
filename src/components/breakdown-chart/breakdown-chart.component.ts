import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-breakdown-chart',
  imports: [NgxChartsModule],
  templateUrl: './breakdown-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreakdownChartComponent {
  data = input.required<any[]>();

  // Chart options
  gradient: boolean = false;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';

  colorScheme = {
    domain: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC', '#26A69A']
  };
}