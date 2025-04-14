import { Icon } from "./icon";
import { NavLink, useNavigate, useNavigation, useRouteLoaderData } from "@remix-run/react";
import Logo from "~/assets/images/logo.svg";
import { useReducer } from "react";
import { cn } from "~/lib/tw-merge";
import { NavbarElements } from "~/lib/contstants";
import { Link } from "@remix-run/react";
import { canViewElement } from "~/lib/check-permission";
import LoadingOverlay from "./loading-overlay";

const Navbar = () => {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { user } = useRouteLoaderData<any>("root");

  const [isMenuOpen, toggleMenu] = useReducer((st) => !st, false);

  const handleLogout = () => {
    navigate("/logout");
  };

  const AuthActions = () =>
    user ? (
      <div className="h-full flex flex-auto  justify-end   ">
        <button
          onClick={handleLogout}
          className="button  font-bold text-center text-xs md:text-sm  md:p-3 rounded-lg text-gray-700 hover:bg-black/5 transition-all">
          تسجيل الخروج
        </button>
      </div>
    ) : (
      <div className="visitors flex flex-auto  justify-end  gap-x-4">
        <button
          onClick={() => navigate("/join")}
          className="button font-bold text-xs  md:text-sm text-center p-3 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
        >
          {" "}
          انضمام
        </button>
        <button
          onClick={() => navigate("/login")}
          className="button font-bold text-xs  md:text-sm text-center p-3 rounded-lg text-gray-700 hover:bg-black/5 transition-all"
        >
          دخول
        </button>
      </div>
    );
  const DisplayedNavList = () => (
    <ul className="flex flex-col-reverse md:flex-row  items-end gap-x-8 gap-y-8 ">
      {NavbarElements.filter((element) =>
        canViewElement(element, user as any)
      ).map((element) => (
        <li
          key={element.id}
          className="flex cursor-pointer font-bold text-gray-700"
        >
          <NavLink
            prefetch="intent"
            to={element.link}
          >
            <span>{element.arabicLabel}</span>
            {element.children && element.children.length && (
              <Icon name="below-arrow" size="sm" />
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <nav className="z-50   fixed w-full h-12 md:h-16  bg-white/95 mx-auto md:justify-center justify-normal flex items-center py-2 lg:px-32  px-3 gap-x-8">
      {navigation.state === "loading" &&<LoadingOverlay message="جاري التحميل"/>}   
      <Link to="/">
        <img
          className={"h-8 w-8 md:h-auto md:w-auto  ml-auto md:ml-0"}
          src={Logo}
          alt="logo"
        />
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
      <AuthActions />

      <div className="md:hidden  mr-auto">
        <Icon
          onClick={toggleMenu}
          name={`${isMenuOpen ? "close" : "menu"}`}
          size="xl3"
          className=" p-2 hover:bg-black/5 transition-all  "
        />
      </div>
    </nav>
  );
};

export default Navbar;
