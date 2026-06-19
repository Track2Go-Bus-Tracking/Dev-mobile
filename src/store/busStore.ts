import { create } from 'zustand';
import type {
  Bus,
  BusWithDetails,
  EmergencyAlert,
  GpsLog,
  PassengerCount,
  SeatStatus,
} from '@/types';
import { busService } from '@/services/busService';
import { emergencyService } from '@/services/emergencyService';

interface BusState {
  buses: Bus[];
  busDetails: BusWithDetails[];
  gpsLogs: GpsLog[];
  seatStatus: SeatStatus[];
  passengerCounts: PassengerCount[];
  emergencies: EmergencyAlert[];
  selectedBusId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchBusDetails: (busId?: string) => Promise<void>;
  setSelectedBusId: (id: string | null) => void;
  getSelectedBus: () => BusWithDetails | undefined;
}

export const useBusStore = create<BusState>((set, get) => ({
  buses: [],
  busDetails: [],
  gpsLogs: [],
  seatStatus: [],
  passengerCounts: [],
  emergencies: [],
  selectedBusId: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [buses, details, emergencies] = await Promise.all([
        busService.getAll(),
        busService.getWithDetails(),
        emergencyService.getAll('active'),
      ]);

      set({
        buses,
        busDetails: details,
        gpsLogs: details.map((d) => d.gps).filter(Boolean) as GpsLog[],
        seatStatus: details.map((d) => d.seats).filter(Boolean) as SeatStatus[],
        passengerCounts: details.map((d) => d.passengers).filter(Boolean) as PassengerCount[],
        emergencies,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load bus data',
        isLoading: false,
      });
    }
  },

  fetchBusDetails: async (busId) => {
    set({ isLoading: true, error: null });
    try {
      const details = await busService.getWithDetails(busId);
      set({ busDetails: details, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load bus details',
        isLoading: false,
      });
    }
  },

  setSelectedBusId: (id) => set({ selectedBusId: id }),

  getSelectedBus: () => {
    const { busDetails, selectedBusId } = get();
    if (!selectedBusId) return busDetails[0];
    return busDetails.find((b) => b.id === selectedBusId) ?? busDetails[0];
  },
}));
