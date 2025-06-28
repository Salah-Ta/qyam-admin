import { Icon } from "./icon";
import {
  NavLink,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "@remix-run/react";
import Logo from "~/assets/images/logo.svg";
import { useReducer } from "react";
import { cn } from "~/lib/tw-merge";
import { NavbarElements } from "~/lib/contstants";
import { Link } from "@remix-run/react";
import { canViewElement } from "~/lib/check-permission";


import DashboardNav from "./dashboardNav";

const Navbar = () => {

  return (
    <>
      <DashboardNav />

      {/* <nav className="z-50   fixed w-full h-12 md:h-16  bg-white/95 mx-auto md:justify-center justify-normal flex items-center py-2 lg:px-32  px-3 gap-x-8">
        {navigation.state === "loading" && (
          <LoadingOverlay message="جاري التحميل" />
        )}
        <Link to="/">
          <img
            className={"h-8 w-8 md:h-auto md:w-auto  ml-auto md:ml-0"}
            src={Logo}
            alt="logo"
          />
        </Link>

        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <div
          className={cn(
            " md:bg-transparent bg-white/95 md:h-auto h-[60vh] md:w-fit md:max-w-full max-w-[300px] w-2/3 md:rounded-none md:p-0 p-5 rounded-r-lg text-right md:static absolute top-12 left-0",
            "transform transition-transform duration-300 ease-in-out",
            isMenuOpen ? "translate-x-0" : "-translate-x-full",
            "md:transform-none md:translate-x-0"
          )}
        >
          <DisplayedNavList />
        </div>

        <div className="md:hidden  mr-auto">
          <Icon
            onClick={toggleMenu}
            name={`${isMenuOpen ? "close" : "menu"}`}
            size="xl3"
            className=" p-2 hover:bg-black/5 transition-all  "
          />
        </div>
      </nav> */}
    </>
  );
};

export default Navbar;
