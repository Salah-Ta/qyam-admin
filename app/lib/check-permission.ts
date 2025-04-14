import { QUser } from "~/types/types";
import type { NavElement } from "./contstants";

export const canViewElement = (
  element: NavElement,
  user: QUser|null
) => {
  
  switch (element.requiredRole) {
    case "admin":
      return user?.role === "admin";
    case "user":
      return (user?.role === "user" && user.acceptenceState==="accepted") || user?.role ==="admin";
    case "userOnly":
      return user?.role === "user" && user.acceptenceState==="accepted"
    case "all":
      return true;
    case null:
    default:
      return false;
  }
};