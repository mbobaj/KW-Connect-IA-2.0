import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DeviceReading } from '../../services/supabase.service';

@Component({
  selector: 'app-supabase-readings',
  templateUrl: './supabase-readings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe]
})
export class SupabaseReadingsComponent {
  readings = input.required<DeviceReading[]>();

  // State for filtering and sorting
  startDate = signal('');
  endDate = signal('');
  sortKey = signal<'created_at' | 'device_id'>('created_at');
  sortDirection = signal<'asc' | 'desc'>('desc');

  filteredAndSortedReadings = computed(() => {
    let filtered = [...this.readings()];

    // Date filtering
    const start = this.startDate();
    const end = this.endDate();

    if (start) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0); // Start of the day
      filtered = filtered.filter(r => r.created_at && new Date(r.created_at) >= startDate);
    }
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(r => r.created_at && new Date(r.created_at) <= endDate);
    }

    // Sorting
    const key = this.sortKey();
    const direction = this.sortDirection() === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      if (key === 'created_at') {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return (dateA - dateB) * direction;
      }
      if (key === 'device_id') {
        return a.device_id.localeCompare(b.device_id) * direction;
      }
      return 0;
    });

    return filtered;
  });

  // Event handlers
  updateDateFilter(event: Event, type: 'start' | 'end') {
    const value = (event.target as HTMLInputElement).value;
    if (type === 'start') {
      this.startDate.set(value);
    } else {
      this.endDate.set(value);
    }
  }

  changeSort(key: 'created_at' | 'device_id') {
    if (this.sortKey() === key) {
      // If same key, toggle direction
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      // If new key, set key and default direction
      this.sortKey.set(key);
      this.sortDirection.set(key === 'created_at' ? 'desc' : 'asc');
    }
  }
  
  clearFilters() {
    this.startDate.set('');
    this.endDate.set('');
  }
}
