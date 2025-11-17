import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-history-chart',
  imports: [NgxChartsModule],
  templateUrl: './history-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryChartComponent {
  data = input.required<any[]>();

  // Chart options
  legend: boolean = false;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = false;
  xAxisLabel: string = 'Hora';
  yAxisLabel: string = 'Consumo (kWh)';
  timeline: boolean = false;

  colorScheme = {
    domain: ['#42A5F5'] // Material Design Blue
  };
}