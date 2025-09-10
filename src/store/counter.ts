import { create } from 'zustand'

interface CounterState {
  count: number
  doubleCount: number
  increment: () => void
}

export const useCounterStore = create<CounterState>((set, get) => ({
  count: 0,
  get doubleCount() {
    return get().count * 2
  },
  increment: () => set((state) => ({ count: state.count + 1 })),
}))