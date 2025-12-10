import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { Device } from './power.types';
import { AnalysisContext } from './gemini.types';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenAI;
  
  constructor() {
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable not set for Gemini Service.");
    }
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private async generateKiWaContent(prompt: string): Promise<string> {
    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      return response.text;
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      return 'Lo siento, no pude procesar tu solicitud en este momento. Por favor, intenta de nuevo más tarde.';
    }
  }

  async generateContent(prompt: string): Promise<string> {
    const fullPrompt = `
      Eres Ki-Wa, un asistente de IA amigable y experto en eficiencia energética en Chile. 
      Responde a la siguiente pregunta del usuario de manera concisa y útil. Siempre responde como Ki-Wa.
      
      Usuario: "${prompt}"
    `;
    return this.generateKiWaContent(fullPrompt);
  }

  async analyzeConsumption(context: AnalysisContext): Promise<string> {
    const deviceDetails = context.devices.map(d => 
      `- ${d.deviceName}: ${d.currentWattage.toFixed(1)}W (Estado: ${d.status}) | Consumo Hoy: ${d.todayKWh.toFixed(2)} kWh ${d.temperature ? `| Temp: ${d.temperature.toFixed(1)}°C` : ''}`
    ).join('\n');
    
    const historySummary = context.aggregate24hHistory.map(h => `  - ${h.name}:00 -> ${h.value} kWh`).join('\n');

    const prompt = `
      Eres Ki-Wa, un asistente experto en eficiencia energética para el hogar en Chile.
      Tu tarea es analizar un "snapshot" completo del consumo eléctrico de una casa y dar consejos claros, accionables y personalizados para reducir el consumo.
      Considera los patrones de consumo, costos eléctricos típicos y electrodomésticos comunes de Chile en 2025. Presta especial atención a los altos consumidores como hervidores y calefactores eléctricos. Explica conceptos como el "consumo fantasma" (standby) cuando sea relevante.

      Aquí están los datos completos del panel:
      
      **Indicadores Clave (KPIs):**
      - Consumo Total Actual: ${context.kpis.currentConsumptionKW.toFixed(2)} kW
      - Consumo Acumulado Hoy: ${context.kpis.totalTodayKWh.toFixed(2)} kWh
      - Costo Mensual Estimado: $${new Intl.NumberFormat('es-CL').format(context.kpis.estimatedMonthlyCostCLP)} CLP
      - Pico de Consumo Hoy: ${context.kpis.peakToday.value} kWh a las ${context.kpis.peakToday.time}

      **Estado Detallado de Dispositivos:**
      ${deviceDetails}

      **Resumen Histórico de Consumo (últimas 24h):**
      ${historySummary}

      Por favor, realiza lo siguiente en tu respuesta:
      1.  **Análisis General:** Comenta brevemente sobre el estado general del consumo. Correlaciona el consumo actual con los datos históricos y el pico de hoy.
      2.  **Identifica Claves:** Señala los 2 o 3 dispositivos que más están impactando el consumo, considerando tanto su potencia actual como su consumo acumulado del día.
      3.  **Consejos Personalizados y Contextualizados:** Ofrece 3 a 4 consejos prácticos y específicos basados en TODOS los datos proporcionados. Por ejemplo, si el aire acondicionado está encendido pero la temperatura del sensor es baja, sugiere ajustar el termostato. Si un dispositivo con alto consumo en standby está en ese modo, explícalo.
      4.  **Tono:** Sé amigable, útil y motivador. Usa un lenguaje fácil de entender. Siempre preséntate y responde como Ki-Wa.
    `;

    return this.generateKiWaContent(prompt);
  }

  async getQuickTip(): Promise<string> {
    const prompt = `
      Eres Ki-Wa, un asistente de IA experto en energía para Chile. 
      Dame un consejo de ahorro de energía rápido, útil y fácil de implementar en un hogar chileno. Sé breve y directo.
    `;
    return this.generateKiWaContent(prompt);
  }

  async getHighestConsumer(devices: Device[]): Promise<string> {
    const activeDevices = devices.filter(d => d.status === 'on');
    if (activeDevices.length === 0) {
      return "Parece que no hay dispositivos encendidos en este momento. ¡Buen trabajo ahorrando energía!";
    }

    const highestConsumer = activeDevices.reduce((max, d) => d.currentWattage > max.currentWattage ? d : max, activeDevices[0]);

    const prompt = `
      Eres Ki-Wa, un asistente de IA.
      El dispositivo que más está consumiendo energía en este momento es el/la "${highestConsumer.deviceName}" con ${highestConsumer.currentWattage.toFixed(0)}W.
      Explica brevemente por qué este dispositivo es un alto consumidor y da un consejo específico para usarlo de manera más eficiente.
    `;
    return this.generateKiWaContent(prompt);
  }

  async getStandbyOptimization(devices: Device[]): Promise<string> {
    const standbyDevices = devices.filter(d => d.status === 'standby');
    if (standbyDevices.length === 0) {
      return "¡Excelente! No he detectado dispositivos en modo 'standby'. Estás evitando el consumo fantasma.";
    }

    const deviceData = standbyDevices.map(d => 
      `- ${d.deviceName}: ${d.standbyWattage.toFixed(1)}W`
    ).join('\n');

    const prompt = `
      Eres Ki-Wa, un asistente de IA.
      He detectado los siguientes dispositivos en modo de espera (standby), lo que genera "consumo fantasma":
      ${deviceData}
      
      Explica brevemente qué es el consumo fantasma y da 2 consejos prácticos para reducirlo basándote en esta lista.
    `;
    return this.generateKiWaContent(prompt);
  }
}
