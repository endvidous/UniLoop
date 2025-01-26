export const navigateToRole = (role: string): any => {
  switch (role) {
    case "admin":
      return "/(authenticated)/(admin)/Home";

    case "teacher":
      return "/(authenticated)/(teacher)/Home";

    case "student":
      return "/(authenticated)/(student)/Home";

    default:
      return "/(auth)";
  }
};
