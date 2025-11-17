
import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { PowerService } from './services/power.service';
import { HeaderComponent } from './components/header/header.component';
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { HistoryChartComponent } from './components/history-chart/history-chart.component';
import { BreakdownChartComponent } from './components/breakdown-chart/breakdown-chart.component';
import { DeviceListComponent } from './components/device-list/device-list.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    KpiCardComponent,
    HistoryChartComponent,
    BreakdownChartComponent,
    DeviceListComponent
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private powerService = inject(PowerService);
  private CLP_PER_KWH = 190;

  devices = this.powerService.devices;

  // KPI Computations
  kpiCurrentConsumption = computed(() => {
    const totalWatts = this.devices()
      .filter(d => d.status === 'on')
      .reduce((sum, d) => sum + d.currentWattage, 0);
    return (totalWatts / 1000).toFixed(2);
  });

  kpiTotalToday = computed(() => {
    const totalKWh = this.devices().reduce((sum, d) => sum + d.todayKWh, 0);
    return totalKWh.toFixed(2);
  });

  kpiMonthlyCost = computed(() => {
    const dailyKWh = this.devices().reduce((sum, d) => sum + d.todayKWh, 0);
    const estimatedMonthlyKWh = dailyKWh * 30;
    const cost = estimatedMonthlyKWh * this.CLP_PER_KWH;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(cost);
  });

  kpiPeakToday = computed(() => {
    const aggregateHistory = this.getAggregateHourlyHistory();
    if (aggregateHistory.length === 0) return { value: '0', time: 'N/A' };

    const peak = aggregateHistory.reduce((max, point) => point.value > max.value ? point : max, aggregateHistory[0]);
    return {
      value: peak.value.toFixed(2),
      time: `${peak.name}:00`
    };
  });

  // Chart Data Computations
  historyChartData = computed(() => {
    return [{
      name: 'Consumption',
      series: this.getAggregateHourlyHistory()
    }];
  });

  breakdownChartData = computed(() => {
    return this.devices()
      .filter(d => d.status === 'on' && d.currentWattage > 0)
      .map(d => ({ name: d.deviceName, value: d.currentWattage }));
  });

  private getAggregateHourlyHistory() {
    const aggregate = new Array(24).fill(0);
    this.devices().forEach(device => {
      device.hourlyHistoryKWh.forEach((val, hour) => {
        aggregate[hour] += val;
      });
    });

    const now = new Date();
    const currentHour = now.getHours();

    return aggregate.map((value, index) => {
       const hour = (currentHour - 23 + index + 24) % 24; // Time travel for x-axis
       return {
         name: hour.toString().padStart(2, '0'),
         value: parseFloat(value.toFixed(2))
       }
    }).sort((a,b) => parseInt(a.name) - parseInt(b.name));
  }
  
  handleToggleDevice(deviceName: string) {
    this.powerService.toggleDeviceStatus(deviceName);
  }
}
