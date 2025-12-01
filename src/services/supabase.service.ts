import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

// Define the type for a reading from Supabase, matching the table structure
export interface DeviceReading {
  id: number;
  device_id: string;
  temp_c: number | null;
  humidity: number | null;
  created_at: string | null;
  // Other fields from the table can be added here if needed
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseUrl = 'https://dzitlrwtzdxfbwervxyt.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6aXRscnd0emR4ZmJ3ZXJ2eHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTQ4ODIsImV4cCI6MjA3OTU3MDg4Mn0.bxNV5jtq7wQCHx96g6pFGG5PZUrBk0OFgVaH9beAazQ';
  private supabase: SupabaseClient;

  private readingsSignal = signal<DeviceReading[]>([]);
  public allReadings = this.readingsSignal.asReadonly();

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    this.getInitialReadings();
    this.subscribeToNewReadings();
  }

  /**
   * Fetches the most recent readings from the table.
   */
  public async getInitialReadings(): Promise<void> {
    const { data, error } = await this.supabase
      .from('device_readings')
      .select('id, device_id, temp_c, humidity, created_at')
      .order('created_at', { ascending: false })
      .limit(50); // Fetch the last 50 readings to start with

    if (error) {
      console.error('Error fetching initial Supabase data:', error);
      return;
    }
    
    this.readingsSignal.set(data as DeviceReading[]);
  }

  /**
   * Clears the current list of readings from the signal.
   */
  public clearReadings(): void {
    this.readingsSignal.set([]);
  }
  
  /**
   * Listens for new readings in real-time and updates the readings signal.
   */
  private subscribeToNewReadings(): RealtimeChannel {
    const channel = this.supabase
      .channel('device_readings_insert')
      .on<DeviceReading>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'device_readings' },
        (payload) => {
          console.log('New Supabase reading received:', payload.new);
          this.readingsSignal.update(currentReadings => {
            const newReadings = [payload.new as DeviceReading, ...currentReadings];
            // Keep the list to a maximum of 50 items for performance
            return newReadings.slice(0, 50); 
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to Supabase real-time updates!');
        }
        if (status === 'CHANNEL_ERROR' || err) {
          console.error('Supabase subscription error:', err);
        }
      });
      
    return channel;
  }
}