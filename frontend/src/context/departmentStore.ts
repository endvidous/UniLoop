import { create } from "zustand";

interface Department {
  id: number;
  name: string;
}

interface DepartmentStore {
  departments: Department[];
  setDepartments: (departments: Department[]) => void;
}

export const useDepartmentStore = create<DepartmentStore>((set) => ({
  departments: [],
  setDepartments: (departments) => set({ departments }),
}));
