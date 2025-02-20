// src/hooks/api/useAssociations.ts
import { useQuery } from "@tanstack/react-query";
import { userAssociationService } from "@/src/services/api/userAssociationsAPI";

type Department = { _id: string; name: string };
type Course = { _id: string; name: string; code: string };
type Batch = { _id: string; code: string };

type AssociationResponse = {
  departments: Department[];
  courses: Course[];
  batches: Batch[];
};

export const useUserAssociations = () => {
  return useQuery<AssociationResponse>({
    queryKey: ["userAssociations"],
    queryFn: () => userAssociationService.getAssociations(), // Add parentheses to execute the function
    staleTime: 60 * 60 * 1000,
  });
};
