export function getRedirectPathForRole(role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "kitchen":
      return "/kitchen";
    case "waiter":
      return "/waiter";
    case "rider":
      return "/rider";
    default:
      return "/"; // customer
  }
}