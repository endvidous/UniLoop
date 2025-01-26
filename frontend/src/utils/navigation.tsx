export const navigateToRole = (role: string): any => {
  switch (role) {
    case "admin":
      return "/(authenticated)/(admin)";

    case "teacher":
      return "/(authenticated)/(teacher)";

    case "student":
      return "/(authenticated)/(student)";

    default:
      return "/(auth)";
  }
};
