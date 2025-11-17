import { Injectable, signal } from '@angular/core';
import { Device } from './power.types';

// Helper to generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Realistic usage patterns for a 24-hour cycle.
// Values represent a multiplier on base wattage.
const USAGE_PATTERNS = {
  ALWAYS_ON: Array(24).fill(1).map((v, i) => (i % 4 === 0 ? 1.2 : 0.8) + (Math.random() * 0.2 - 0.1)), // Refrigerator compressor cycles
  EVENING_PEAK: [0,0,0,0,0,0,0.1,0.2,0.3,0.2,0.1,0,0,0,0,0,0.1,0.4,0.8,1,1,0.9,0.5,0.1], // TV, Lights
  DAY_TIME: [0,0,0,0,0,0,0.1,0.3,0.8,0.9,0.9,1,1,0.9,0.8,0.7,0.6,0.5,0.4,0.2,0.1,0,0,0], // Computer
  SUMMER_AC: [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.2,0.3,0.4,0.6,0.8,1,1,1,0.9,0.8,0.6,0.4,0.2,0.1,0.1,0.1], // AC, higher in afternoon
  INTERMITTENT: Array(24).fill(0).map(() => Math.random() > 0.9 ? Math.random() * 4 : 0.05) // Microwave, Kettle (high power, short use)
};

const INITIAL_DEVICES: Device[] = [
  { deviceId: generateUUID(), deviceName: 'Refrigerador', status: 'on', currentWattage: 150, todayKWh: 1.8, hourlyHistoryKWh: USAGE_PATTERNS.ALWAYS_ON.map(p => p * 0.1), icon: 'fridge', baseWattage: 150 },
  { deviceId: generateUUID(), deviceName: 'Aire Acondicionado', status: 'off', currentWattage: 0, todayKWh: 3.5, hourlyHistoryKWh: USAGE_PATTERNS.SUMMER_AC.map(p => p * 1.5), icon: 'ac', baseWattage: 2000 },
  { deviceId: generateUUID(), deviceName: 'Televisor Living', status: 'standby', currentWattage: 2, todayKWh: 0.4, hourlyHistoryKWh: USAGE_PATTERNS.EVENING_PEAK.map(p => p * 0.12), icon: 'tv', baseWattage: 120 },
  { deviceId: generateUUID(), deviceName: 'Luces Living', status: 'off', currentWattage: 0, todayKWh: 0.2, hourlyHistoryKWh: USAGE_PATTERNS.EVENING_PEAK.map(p => p * 0.06), icon: 'lights', baseWattage: 60 },
  { deviceId: generateUUID(), deviceName: 'Microondas', status: 'standby', currentWattage: 1, todayKWh: 0.1, hourlyHistoryKWh: USAGE_PATTERNS.INTERMITTENT.map(p => p * 0.05), icon: 'microwave', baseWattage: 900 },
  { deviceId: generateUUID(), deviceName: 'Computador', status: 'on', currentWattage: 250, todayKWh: 1.2, hourlyHistoryKWh: USAGE_PATTERNS.DAY_TIME.map(p => p * 0.25), icon: 'computer', baseWattage: 250 },
  { deviceId: generateUUID(), deviceName: 'Hervidor', status: 'standby', currentWattage: 1, todayKWh: 0.3, hourlyHistoryKWh: USAGE_PATTERNS.INTERMITTENT.map(p => p * 0.1), icon: 'kettle', baseWattage: 1800 },
  { deviceId: generateUUID(), deviceName: 'Lavadora', status: 'off', currentWattage: 0, todayKWh: 0.8, hourlyHistoryKWh: Array(24).fill(0).map((_, i) => (i > 9 && i < 12) ? Math.random() * 0.5 : 0), icon: 'washing-machine', baseWattage: 500 },
];

@Injectable({
  providedIn: 'root'
})
export class PowerService {
  devices = signal<Device[]>(INITIAL_DEVICES);

  constructor() {
    setInterval(() => this.simulateDataUpdate(), 15000);
  }

  private getUsagePattern(deviceName: string): number[] {
    if (deviceName.includes('Refrigerador')) return USAGE_PATTERNS.ALWAYS_ON;
    if (deviceName.includes('Aire')) return USAGE_PATTERNS.SUMMER_AC;
    if (deviceName.includes('Televisor') || deviceName.includes('Luces')) return USAGE_PATTERNS.EVENING_PEAK;
    if (deviceName.includes('Computador')) return USAGE_PATTERNS.DAY_TIME;
    if (deviceName.includes('Microondas') || deviceName.includes('Hervidor')) return USAGE_PATTERNS.INTERMITTENT;
    if (deviceName.includes('Lavadora')) return USAGE_PATTERNS.DAY_TIME; // Assume daytime usage
    return Array(24).fill(1); // Default pattern
  }

  private simulateDataUpdate(): void {
    const currentHour = new Date().getHours();
    
    this.devices.update(currentDevices => 
      currentDevices.map(device => {
        // Calculate consumption from the last interval based on the current wattage
        const kwhAdded = (device.currentWattage / 1000) * (15 / 3600); // 15 seconds interval
        const updatedTodayKWh = device.todayKWh + kwhAdded;
        
        const updatedHistory = [...device.hourlyHistoryKWh];
        updatedHistory[currentHour] = (updatedHistory[currentHour] || 0) + kwhAdded;

        // Now, determine the new wattage for the NEXT interval
        let newWattage: number;
        
        if (device.status === 'on') {
          const pattern = this.getUsagePattern(device.deviceName);
          const usageMultiplier = pattern[currentHour];
          const fluctuation = (Math.random() - 0.5) * 0.1; // +/- 5% random fluctuation
          newWattage = device.baseWattage * usageMultiplier * (1 + fluctuation);
        } else if (device.status === 'standby') {
          newWattage = device.currentWattage; // Keep it constant, it's defined in INITIAL_DEVICES
        } else { // 'off'
          newWattage = 0;
        }

        return {
          ...device,
          currentWattage: parseFloat(Math.max(0, newWattage).toFixed(2)),
          todayKWh: parseFloat(updatedTodayKWh.toFixed(3)),
          hourlyHistoryKWh: updatedHistory.map(v => parseFloat(v.toFixed(4)))
        };
      })
    );
  }

  toggleDeviceStatus(deviceName: string): void {
    this.devices.update(currentDevices =>
      currentDevices.map(device => {
        if (device.deviceName === deviceName) {
          const newStatus = device.status === 'on' ? 'off' : 'on';
          let newWattage = 0;
          if (newStatus === 'on') {
              const currentHour = new Date().getHours();
              const pattern = this.getUsagePattern(device.deviceName);
              const usageMultiplier = pattern[currentHour];
              newWattage = device.baseWattage * usageMultiplier;
          }
          // Standby devices don't have a toggle, so we only switch between on/off
          return { ...device, status: newStatus, currentWattage: newWattage };
        }
        return device;
      })
    );
  }
}