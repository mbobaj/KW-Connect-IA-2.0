import { Device } from "./power.types";

export interface AnalysisKpis {
    currentConsumptionKW: number;
    totalTodayKWh: number;
    estimatedMonthlyCostCLP: number;
    peakToday: {
        value: string;
        time: string;
    };
}

export interface AnalysisContext {
    kpis: AnalysisKpis;
    devices: Device[];
    aggregate24hHistory: { name: string; value: number }[];
}
