import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { Device } from './power.types';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenAI;
  
  constructor() {
    // IMPORTANT: In a real application, the API key should be handled securely
    // and not be hardcoded. This uses an environment variable placeholder.
    if (!process.env.API_KEY) {
        console.warn("API_KEY environment variable not set for Gemini Service.");
    }
    this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateContent(prompt: string): Promise<string> {
    const fullPrompt = `
      Eres Ki-Wa, un asistente de IA amigable y experto en eficiencia energética en Chile. 
      Responde a la siguiente pregunta del usuario de manera concisa y útil.
      
      Usuario: "${prompt}"
    `;
    try {
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt
      });
      return response.text;
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      return 'Lo siento, no pude procesar tu solicitud en este momento. Por favor, intenta de nuevo más tarde.';
    }
  }

  async analyzeConsumption(devices: Device[]): Promise<string> {
    const activeDevices = devices.filter(d => d.status === 'on' || d.status === 'standby');
    const totalConsumption = activeDevices.reduce((sum, d) => sum + d.currentWattage, 0);

    const deviceData = activeDevices.map(d => 
      `- ${d.deviceName}: ${d.currentWattage.toFixed(1)}W (Estado: ${d.status})`
    ).join('\n');

    const prompt = `
      Eres Ki-Wa, un asistente experto en eficiencia energética para el hogar en Chile.
      Tu tarea es analizar el siguiente listado del consumo eléctrico en tiempo real de una casa y dar consejos claros, accionables y personalizados para reducir el consumo.
      Considera los patrones de consumo y costos eléctricos típicos de Chile en 2025.

      Aquí están los datos de consumo actual:
      - Consumo Total Actual: ${totalConsumption.toFixed(1)}W
      - Desglose por dispositivo:
      ${deviceData}

      Por favor, realiza lo siguiente:
      1.  **Análisis General:** Comenta brevemente sobre el nivel de consumo actual (alto, medio, bajo).
      2.  **Identifica Claves:** Señala los 2 o 3 dispositivos que más están consumiendo en este momento.
      3.  **Consejos Personalizados:** Ofrece 3 a 4 consejos prácticos y específicos basados en los datos. Por ejemplo, si el televisor está en 'standby', sugiere apagarlo completamente. Si el aire acondicionado está encendido, sugiere una temperatura óptima para Chile.
      4.  **Tono:** Sé amigable, útil y motivador. Usa un lenguaje fácil de entender para cualquier persona. Siempre preséntate y responde como Ki-Wa.
    `;

    return this.generateContent(prompt);
  }

  async getQuickTip(): Promise<string> {
    const prompt = `
      Eres Ki-Wa, un asistente de IA experto en energía para Chile. 
      Dame un consejo de ahorro de energía rápido, útil y fácil de implementar en un hogar chileno.
    `;
    return this.generateContent(prompt);
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
    return this.generateContent(prompt);
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
    return this.generateContent(prompt);
  }
}