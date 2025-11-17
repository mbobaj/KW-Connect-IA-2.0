
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent {
  title = input.required<string>();
  value = input.required<string>();
  unit = input.required<string>();
  iconPath = input.required<string>();
}
