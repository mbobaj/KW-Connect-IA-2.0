import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Device, DeviceStatus } from '../../services/power.types';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent {
  devices = input.required<Device[]>();
  setStatus = output<{deviceId: string, status: DeviceStatus}>();

  getIconPath(icon: string): string {
    // Detailed and modern SVG paths
    switch (icon) {
      case 'fridge': return 'M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-3V5h3v6zm-5-6v6H8V5h3zm5 15H8v-6h8v6z';
      case 'ac': return 'M19 15H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2zM5 8v4h14V8H5zm14-5H5c-1.66 0-3 1.34-3 3v6c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3zM18 11H6v-1h12v1zm-3-2H9V8h6v1z';
      case 'tv': return 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z';
      case 'lights': return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.93V15h2v2.93c-1.16-.44-2-1.5-2-2.93zm1-13.93c-3.31 0-6 2.69-6 6s2.69 6 6 6v-2.18c-2.13-.44-3.62-2.39-3.62-4.82h1.62c0 1.54 1.25 2.8 2 2.8s2-1.26 2-2.8h1.62c0 2.43-1.49 4.38-3.62 4.82V10c3.31 0 6-2.69 6-6s-2.69-6-6-6z';
      case 'microwave': return 'M22 6H2c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 10H4V8h16v8zm-5-7h-6v4h6v-4z';
      case 'computer': return 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z';
      case 'kettle': return 'M18.5 3H5.5C4.67 3 4 3.67 4 4.5V9h16V4.5C20 3.67 19.33 3 18.5 3zM6 7V5h12v2H6zm12 3H6c-1.66 0-3 1.34-3 3v7c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h1.5c1.93 0 3.5-1.57 3.5-3.5S20.43 10 18.5 10z';
      case 'washing-machine': return 'M19 4H5C3.9 4 3 4.9 3 6v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-2 2h-2v2h2V6zm-4 0h-2v2h2V6zm-4 0H7v2h2V6zm8 12H7v-8h10v8zm-5-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z';
      default: return '';
    }
  }

  getStatusColor(status: DeviceStatus): string {
    switch (status) {
      case 'on': return 'bg-green-100 text-green-800';
      case 'off': return 'bg-gray-100 text-gray-700';
      case 'standby': return 'bg-yellow-100 text-yellow-800';
    }
  }

  onSetStatus(deviceId: string, status: DeviceStatus) {
    this.setStatus.emit({ deviceId, status });
  }
}