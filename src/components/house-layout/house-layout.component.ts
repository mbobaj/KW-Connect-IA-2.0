import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { Device, DeviceStatus } from '../../services/power.types';

@Component({
  selector: 'app-house-layout',
  templateUrl: './house-layout.component.html',
  styles: [`
    .device-pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.1);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HouseLayoutComponent {
  devices = input.required<Device[]>();
  hoveredDevice = signal<Device | null>(null);

  getStatusColorClass(status: DeviceStatus): string {
    switch (status) {
      case 'on': return 'text-green-500';
      case 'off': return 'text-gray-400';
      case 'standby': return 'text-yellow-500';
    }
  }

  onDeviceMouseOver(device: Device) {
    this.hoveredDevice.set(device);
  }

  onDeviceMouseOut() {
    this.hoveredDevice.set(null);
  }
}