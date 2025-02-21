export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  classrep_of?: string;
  mentor_of?: string;
}
