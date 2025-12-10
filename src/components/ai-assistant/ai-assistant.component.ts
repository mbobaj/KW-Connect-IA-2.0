import { Component, ChangeDetectionStrategy, input, signal, inject, ViewChild, ElementRef, afterNextRender } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { Device } from '../../services/power.types';
import { AnalysisContext } from '../../services/gemini.types';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

@Component({
  selector: 'app-ai-assistant',
  templateUrl: './ai-assistant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiAssistantComponent {
  analysisContext = input.required<AnalysisContext>();
  private geminiService = inject(GeminiService);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  userInput = signal('');
  messages = signal<Message[]>([
    { role: 'bot', content: '¡Hola! Soy Ki-Wa, tu asistente de energía. Pregúntame sobre tu consumo o pídeme un análisis en tiempo real.' }
  ]);
  isLoading = signal(false);

  constructor() {
    afterNextRender(() => {
        this.scrollToBottom();
    });
  }

  async sendMessage(): Promise<void> {
    const userMessage = this.userInput().trim();
    if (!userMessage || this.isLoading()) return;

    // Add user message to chat
    this.messages.update(m => [...m, { role: 'user', content: userMessage }]);
    this.userInput.set('');
    this.isLoading.set(true);
    this.scrollToBottom();

    // Get bot response
    const botResponse = await this.geminiService.generateContent(userMessage);
    this.messages.update(m => [...m, { role: 'bot', content: botResponse }]);
    this.isLoading.set(false);
    this.scrollToBottom();
  }
  
  async analyzeConsumption(): Promise<void> {
    if (this.isLoading()) return;

    const userMessage = "Analizar Consumo Actual";
    this.messages.update(m => [...m, { role: 'user', content: userMessage }]);
    this.isLoading.set(true);
    this.scrollToBottom();
    
    const botResponse = await this.geminiService.analyzeConsumption(this.analysisContext());
    this.messages.update(m => [...m, { role: 'bot', content: botResponse }]);
    this.isLoading.set(false);
    this.scrollToBottom();
  }

  async getQuickTip(): Promise<void> {
    if (this.isLoading()) return;
    this.messages.update(m => [...m, { role: 'user', content: "Dame un consejo rápido" }]);
    this.isLoading.set(true);
    this.scrollToBottom();

    const botResponse = await this.geminiService.getQuickTip();
    this.messages.update(m => [...m, { role: 'bot', content: botResponse }]);
    this.isLoading.set(false);
    this.scrollToBottom();
  }

  async getHighestConsumer(): Promise<void> {
    if (this.isLoading()) return;
    this.messages.update(m => [...m, { role: 'user', content: "¿Cuál es mi mayor gasto?" }]);
    this.isLoading.set(true);
    this.scrollToBottom();

    const botResponse = await this.geminiService.getHighestConsumer(this.analysisContext().devices);
    this.messages.update(m => [...m, { role: 'bot', content: botResponse }]);
    this.isLoading.set(false);
    this.scrollToBottom();
  }

  async getStandbyTips(): Promise<void> {
    if (this.isLoading()) return;
    this.messages.update(m => [...m, { role: 'user', content: "Optimizar Standby" }]);
    this.isLoading.set(true);
    this.scrollToBottom();

    const botResponse = await this.geminiService.getStandbyOptimization(this.analysisContext().devices);
    this.messages.update(m => [...m, { role: 'bot', content: botResponse }]);
    this.isLoading.set(false);
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
        setTimeout(() => {
            if (this.scrollContainer?.nativeElement) {
               this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            }
        }, 0);
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }
}
