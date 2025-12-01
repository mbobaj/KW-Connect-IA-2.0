import { Injectable, signal, inject, effect } from '@angular/core';
import { Device, DeviceStatus } from './power.types';
import { SupabaseService } from './supabase.service';

// Helper to generate UUIDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Realistic usage patterns for a 24-hour cycle.
const USAGE_PATTERNS = {
  ALWAYS_ON: Array(24).fill(1).map((v, i) => (i % 4 === 0 ? 1.2 : 0.8) + (Math.random() * 0.2 - 0.1)),
  EVENING_PEAK: [0,0,0,0,0,0,0.1,0.2,0.3,0.2,0.1,0,0,0,0,0,0.1,0.4,0.8,1,1,0.9,0.5,0.1],
  DAY_TIME: [0,0,0,0,0,0,0.1,0.3,0.8,0.9,0.9,1,1,0.9,0.8,0.7,0.6,0.5,0.4,0.2,0.1,0,0,0],
  SUMMER_AC: [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.2,0.3,0.4,0.6,0.8,1,1,1,0.9,0.8,0.6,0.4,0.2,0.1,0.1,0.1],
  INTERMITTENT: Array(24).fill(0).map(() => Math.random() > 0.9 ? Math.random() * 4 : 0.05)
};

const INITIAL_DEVICES: Device[] = [
  // Se añade supabaseId para mapear con los sensores de Supabase.
  { deviceId: generateUUID(), deviceName: 'Refrigerador', status: 'on', currentWattage: 120, todayKWh: 1.8, hourlyHistoryKWh: USAGE_PATTERNS.ALWAYS_ON.map(p => p * 0.12), icon: 'fridge', baseWattage: 120, standbyWattage: 2, position: { x: 375, y: 135 }, supabaseId: 'SENSOR-FRIDGE-01' },
  { deviceId: generateUUID(), deviceName: 'Aire Acondicionado', status: 'off', currentWattage: 0, todayKWh: 3.5, hourlyHistoryKWh: USAGE_PATTERNS.SUMMER_AC.map(p => p * 1.1), icon: 'ac', baseWattage: 1100, standbyWattage: 1, position: { x: 250, y: 40 }, supabaseId: 'SENSOR-LIVING-AC' },
  { deviceId: generateUUID(), deviceName: 'Televisor Living', status: 'standby', currentWattage: 0.5, todayKWh: 0.4, hourlyHistoryKWh: USAGE_PATTERNS.EVENING_PEAK.map(p => p * 0.075), icon: 'tv', baseWattage: 75, standbyWattage: 0.5, position: { x: 190, y: 150 } },
  { deviceId: generateUUID(), deviceName: 'Luces Living', status: 'off', currentWattage: 0, todayKWh: 0.2, hourlyHistoryKWh: USAGE_PATTERNS.EVENING_PEAK.map(p => p * 0.05), icon: 'lights', baseWattage: 50, standbyWattage: 0, position: { x: 210, y: 90 } },
  { deviceId: generateUUID(), deviceName: 'Microondas', status: 'standby', currentWattage: 2, todayKWh: 0.1, hourlyHistoryKWh: USAGE_PATTERNS.INTERMITTENT.map(p => p * 0.08), icon: 'microwave', baseWattage: 1300, standbyWattage: 2, position: { x: 330, y: 50 } },
  { deviceId: generateUUID(), deviceName: 'Computador', status: 'on', currentWattage: 250, todayKWh: 1.2, hourlyHistoryKWh: USAGE_PATTERNS.DAY_TIME.map(p => p * 0.25), icon: 'computer', baseWattage: 250, standbyWattage: 5, position: { x: 60, y: 190 }, supabaseId: 'ESP8266-93b324' },
  { deviceId: generateUUID(), deviceName: 'Hervidor', status: 'standby', currentWattage: 1, todayKWh: 0.3, hourlyHistoryKWh: USAGE_PATTERNS.INTERMITTENT.map(p => p * 0.12), icon: 'kettle', baseWattage: 1800, standbyWattage: 1, position: { x: 330, y: 90 } },
  { deviceId: generateUUID(), deviceName: 'Lavadora', status: 'off', currentWattage: 0, todayKWh: 0.8, hourlyHistoryKWh: Array(24).fill(0).map((_, i) => (i > 9 && i < 12) ? Math.random() * 0.5 : 0), icon: 'washing-machine', baseWattage: 500, standbyWattage: 1.5, position: { x: 180, y: 215 } },
];

@Injectable({
  providedIn: 'root'
})
export class PowerService {
  devices = signal<Device[]>(INITIAL_DEVICES);
  private supabaseService = inject(SupabaseService);

  constructor() {
    // React to changes from the Supabase service
    effect(() => {
      const readings = this.supabaseService.allReadings();
      if (readings.length > 0) {
        this.updateDevicesWithLatestReadings(readings);
      }
    });

    setInterval(() => this.simulateDataUpdate(), 15000);
  }

  private updateDevicesWithLatestReadings(readings: import("./supabase.service").DeviceReading[]) {
     // Process to get only the latest reading for each unique device_id
    const latestReadings = new Map<string, import("./supabase.service").DeviceReading>();
    for (const reading of readings) {
      if (!latestReadings.has(reading.device_id)) {
        latestReadings.set(reading.device_id, reading);
      }
    }

    this.devices.update(currentDevices => {
      return currentDevices.map(device => {
        if (device.supabaseId) {
          const reading = latestReadings.get(device.supabaseId);
          if (reading) {
            return {
              ...device,
              temperature: reading.temp_c,
              humidity: reading.humidity
            };
          }
        }
        return device;
      });
    });
  }

  private getUsagePattern(deviceName: string): number[] {
    if (deviceName.includes('Refrigerador')) return USAGE_PATTERNS.ALWAYS_ON;
    if (deviceName.includes('Aire')) return USAGE_PATTERNS.SUMMER_AC;
    if (deviceName.includes('Televisor') || deviceName.includes('Luces')) return USAGE_PATTERNS.EVENING_PEAK;
    if (deviceName.includes('Computador')) return USAGE_PATTERNS.DAY_TIME;
    if (deviceName.includes('Microondas') || deviceName.includes('Hervidor')) return USAGE_PATTERNS.INTERMITTENT;
    if (deviceName.includes('Lavadora')) return USAGE_PATTERNS.DAY_TIME;
    return Array(24).fill(1);
  }

  private simulateDataUpdate(): void {
    const currentHour = new Date().getHours();
    
    this.devices.update(currentDevices => 
      currentDevices.map(device => {
        const kwhAdded = (device.currentWattage / 1000) * (15 / 3600);
        const updatedTodayKWh = device.todayKWh + kwhAdded;
        
        const updatedHistory = [...device.hourlyHistoryKWh];
        updatedHistory[currentHour] = (updatedHistory[currentHour] || 0) + kwhAdded;

        let newWattage: number;
        
        if (device.status === 'on') {
          const pattern = this.getUsagePattern(device.deviceName);
          const usageMultiplier = pattern[currentHour];
          const fluctuation = (Math.random() - 0.5) * 0.1;
          newWattage = device.baseWattage * usageMultiplier * (1 + fluctuation);
        } else if (device.status === 'standby') {
          const fluctuation = (Math.random() - 0.5) * 0.05;
          newWattage = device.standbyWattage * (1 + fluctuation);
        } else {
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

  setDeviceStatus(deviceId: string, status: DeviceStatus): void {
    this.devices.update(currentDevices =>
      currentDevices.map(device => {
        if (device.deviceId === deviceId) {
          let newWattage = 0;
          if (status === 'on') {
              const currentHour = new Date().getHours();
              const pattern = this.getUsagePattern(device.deviceName);
              const usageMultiplier = pattern[currentHour];
              newWattage = device.baseWattage * usageMultiplier;
          } else if (status === 'standby') {
              newWattage = device.standbyWattage;
          }
          return { ...device, status, currentWattage: newWattage };
        }
        return device;
      })
    );
  }
}