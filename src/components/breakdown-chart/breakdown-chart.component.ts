import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
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
  // We will format the label to include the percentage, so we disable the default percentage display.
  showPercentage: boolean = false;

  private totalValue = computed(() => this.data().reduce((sum, d) => sum + d.value, 0));

  colorScheme = {
    domain: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC', '#26A69A']
  };

  /**
   * Formats the label to include both the device name and its consumption percentage.
   * @param name The name of the data item (slice).
   * @returns A formatted string with name and percentage.
   */
  labelFormatting = (name: string): string => {
    const item = this.data().find(d => d.name === name);
    const total = this.totalValue();
    
    if (!item || total === 0) {
      return name;
    }
    
    const percentage = (item.value / total) * 100;
    // Using a newline character to attempt to stack the name and percentage.
    // The chart library should respect this for SVG <tspan> elements.
    return `${name}\n${percentage.toFixed(1)}%`;
  };
}
