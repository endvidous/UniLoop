type Role = string | "admin" | "teacher" | "student";

export const navigateToRole = (role: Role) => {
  return `/(authenticated)/(${role})/(tabs)` as
    | "/(authenticated)/(admin)/(tabs)"
    | "/(authenticated)/(teacher)/(tabs)"
    | "/(authenticated)/(student)/(tabs)";
};
