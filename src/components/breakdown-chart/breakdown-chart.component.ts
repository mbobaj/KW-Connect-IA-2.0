
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
  gradient: boolean = true;
  showLegend: boolean = false;
  showLabels: boolean = true;
  isDoughnut: boolean = true;
  legendPosition: string = 'below';

  colorScheme = {
    domain: ['#2563eb', '#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  };
}
