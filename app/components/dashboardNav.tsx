import { BellIcon, SearchIcon, SettingsIcon, LogOut } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback } from "./UI-dashbord/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./UI-dashbord/navigation-menu";
import yaniaLogo from "../assets/images/new-design/logo-header.svg";
import {
  NavLink,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "@remix-run/react";
import { useReducer } from "react";

export default function dashboardNav() {
  const navigate = useNavigate();
  const navigation = useNavigation();

  const { user } = useRouteLoaderData<any>("root");

  const [isMenuOpen, toggleMenu] = useReducer((st) => !st, false);

  const handleLogout = () => {
    toggleMenu();
    // Perform logout logic here, e.g., clearing session or token and 


    navigate("/logout");
  };

  console.log("user in dashboardNav:", user);
  
  
  const AuthActions = () =>
    user ? (
      <div className="flex items-center gap-4 flex-row">
        <div className="flex items-start gap-1 [direction:rtl]">
          <button className="flex w-10 items-center justify-center p-2 rounded-md overflow-hidden">
            <SearchIcon className="w-5 h-5" />
          </button>
          <button className="flex w-10 items-center justify-center p-2 rounded-md overflow-hidden">
            <SettingsIcon className="w-5 h-5" />
          </button>
          <button className="flex w-10 items-center justify-center p-2 rounded-md overflow-hidden">
            <BellIcon className="w-5 h-5" />
          </button>
        </div>
  
        <div className="flex flex-col items-start">
          <Avatar className="w-10 h-10 bg-neutral-100 border-[0.75px] border-solid border-[#00000014]">
            <AvatarFallback className="text-[#717680] font-semibold">
              OR
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    ) : (
      <div className="visitors flex flex-auto justify-end gap-x-4">
        <button
          onClick={() => navigate("/join")}
          className="button font-bold text-xs md:text-sm text-center p-3 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
        >
          انضمام
        </button>
        <button
          onClick={() => navigate("/login")}
          className="button font-bold text-xs md:text-sm text-center p-3 rounded-lg text-gray-700 hover:bg-black/5 transition-all"
        >
          دخول
        </button>
      </div>
    );
  
  // Navigation menu items data
  const menuItems = [
    {
      id: 3,
      label: "مركز المعرفة",
      path: "/dashboard/infoCenter",
      hasDropdown: false,
    },
    {
      id: 4,
      label: "مدير النظام",
      path: "/dashboard/admin/users",
      hasDropdown: false,
    },
    {
      id: 3,
      label: "المشرف",
      path: "/supervisor/allTrainers",
      hasDropdown: false,
    },
    {
      id: 2,
      label: "المدربة",
      path: "/dashboard/trainer/trainerProfile",
      hasDropdown: false,
    },
    { id: 1, label: "الرئيسة", path: "/", hasDropdown: false },
  ];
  
  return (
    <header
      className="w-full flex justify-center bg-white border-b border-[#e9e9eb] fixed top-0 left-0 right-0 z-50"
      dir="rtl"
    >
      <div className=" max-w-full h-[72px] items-center justify-between w-full flex   py-0 lg:px-[112px] max-lg:px-[62px]">
        {/* Mobile menu button (hidden on desktop) */}
        <button className="md:hidden p-2" onClick={toggleMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
  
        {/* Right side - Navigation and logo */}
        <div className="flex items-center gap-10">
          <div className="relative w-[108.22px] h-[32.65px]">
            <img
              className="absolute w-[108px] h-[33px] top-0 left-0"
              alt="Logo part 1"
              src={yaniaLogo}
            />
          </div>
  
          {/* Desktop navigation (hidden on mobile) */}
          <NavigationMenu className="max-w-none hidden md:block">
            <NavigationMenuList className="flex items-center gap-6">
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  {item.hasDropdown ? (
                    <NavigationMenuTrigger className="hover:none hover:bg-transparent [direction:rtl]">
                      <div className="flex flex-row-reverse items-center justify-center">
                        <span className="font-bold text-[#475467] text-base text-left tracking-[0] leading-6 whitespace-nowrap">
                          {item.label}
                        </span>
                      </div>
                    </NavigationMenuTrigger>
                  ) : (
                    <div className="px-0 py-1">
                      <div className="flex items-center justify-center flex-row-reverse">
                        <button
                          onClick={() => item.path && navigate(`${item.path}`)}
                          className="mt-[-1.00px] font-bold text-[#475467] text-base text-left tracking-[0] leading-6 whitespace-nowrap"
                        >
                          {item.label}
                        </button>
                      </div>
                    </div>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
  
        {/* Left side - User profile and utility icons (hidden on mobile) */}
        <div className=" md:block">
          <AuthActions />
        </div>
  
        {/* Mobile menu (shown when isMenuOpen is true) */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-40 mt-[72px] overflow-y-auto">
            <div className="flex flex-col p-6 space-y-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.path && navigate(`${item.path}`);
                    toggleMenu();
                  }}
                  className="py-3 text-right font-bold text-[#475467] text-base"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4">
           
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
