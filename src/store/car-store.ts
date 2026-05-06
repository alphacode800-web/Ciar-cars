import { create } from 'zustand';
import type { Car } from '@/types';

interface CarState {
  cars: Car[];
  featuredCars: Car[];
  currentCar: Car | null;
  totalCount: number;
  isLoading: boolean;
  page: number;

  setCars: (cars: Car[], totalCount: number) => void;
  setCurrentCar: (car: Car | null) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useCarStore = create<CarState>((set) => ({
  cars: [],
  featuredCars: [],
  currentCar: null,
  totalCount: 0,
  isLoading: false,
  page: 1,

  setCars: (cars, totalCount) =>
    set({ cars, totalCount }),

  setCurrentCar: (car) =>
    set({ currentCar: car }),

  setPage: (page) =>
    set({ page }),

  setLoading: (loading) =>
    set({ isLoading: loading }),
}));
