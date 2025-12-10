import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-history-chart',
  imports: [NgxChartsModule],
  templateUrl: './history-chart.component.html',
  // Se utiliza ::ng-deep para aplicar estilos al componente hijo ngx-charts.
  // Esto aumenta el grosor de la línea para una mejor visibilidad.
  styles: [`
    :host ::ng-deep .area-series .line-series-path {
      stroke-width: 3px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryChartComponent {
  data = input.required<any[]>();

  // Chart options for a cleaner, Material You-inspired look
  legend: boolean = false;
  animations: boolean = false;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true; // Show label for better context
  showXAxisLabel: boolean = false;
  yAxisLabel: string = 'Consumo (kWh)';
  gradient: boolean = true; // Use a gradient fill for a modern aesthetic.
  showGridLines: boolean = true; // Aid readability with subtle grid lines.
  tooltipDisabled: boolean = false; // Ensure tooltips are enabled for detail on hover.

  colorScheme = {
    domain: ['#42A5F5'] // Un azul más vibrante para un gradiente pronunciado.
  };

  /**
   * Formats the Y-axis ticks to be more readable for the user.
   * @param val The numeric value from the axis.
   * @returns A formatted string with units.
   */
  yAxisTickFormatting(val: number): string {
    return `${val.toFixed(1)} kWh`;
  }

  /**
   * Formats the X-axis ticks to show time in HH:00 format.
   * @param val The string value from the axis (hour).
   * @returns A formatted time string.
   */
  xAxisTickFormatting(val: string): string {
    return `${val}:00`;
  }
}