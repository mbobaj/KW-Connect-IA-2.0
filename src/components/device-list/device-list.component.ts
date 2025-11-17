import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Device, DeviceStatus } from '../../services/power.types';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceListComponent {
  devices = input.required<Device[]>();
  toggleDevice = output<string>();

  getIconPath(icon: string): string {
    switch (icon) {
      case 'fridge': return 'M8 3v18h8V3H8zm6 2h-4v2h4V5zm0 4h-4v2h4V9zm-4 8v-4h4v4h-4z';
      case 'ac': return 'M2 13h20v2H2v-2zm2-4h16v2H4V9zm2-4h12v2H6V5z';
      case 'tv': return 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z';
      case 'lights': return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2v-4zm0 6h2v2h-2v-2z';
      case 'microwave': return 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 8h8v2H6zm0 4h5v2H6z';
      case 'computer': return 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z';
      case 'kettle': return 'M18 2H6v2h12V2zm-2 4h-2v2h2V6zM6 8v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V8H6zm2 10h4v-4H8v4z';
      case 'washing-machine': return 'M9.01 15.01L9 15l.01.01zm5.98-5.98L15 9.01l-.01-.01zM9 5H7v2h2V5zm10 0h-2v2h2V5zm-4 0h-2v2h2V5zm4 14H5V9h14v10zm0-12H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM9 11h6v6H9v-6z';
      default: return '';
    }
  }

  getStatusColor(status: DeviceStatus): string {
    switch (status) {
      case 'on': return 'bg-green-500/80 text-green-100';
      case 'off': return 'bg-slate-600/80 text-slate-200';
      case 'standby': return 'bg-yellow-500/80 text-yellow-100';
    }
  }

  onToggle(deviceName: string) {
    this.toggleDevice.emit(deviceName);
  }
}