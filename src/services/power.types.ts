export type DeviceStatus = 'on' | 'off' | 'standby';

export interface Device {
  deviceId: string;
  deviceName: string;
  status: DeviceStatus;
  currentWattage: number;
  todayKWh: number;
  hourlyHistoryKWh: number[]; // 24 values, one for each hour
  icon: string; // An identifier for the SVG icon
  baseWattage: number;
  standbyWattage: number;
  position: { x: number; y: number }; // Coordinates for the house layout
}