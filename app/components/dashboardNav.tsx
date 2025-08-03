import { BellIcon, SearchIcon, SettingsIcon, LogOut } from "lucide-react";
import React, { memo, useCallback, useMemo } from "react";
import { Avatar, AvatarFallback } from "./UI-dashbord/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./UI-dashbord/navigation-menu";
import yaniaLogo from "../assets/images/new-design/logo-header.svg";
import NotificationDropdown from "./NotificationDropdown";
import {
  NavLink,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
} from "@remix-run/react";
import { useReducer } from "react";

// Memoized navigation item component
const NavigationItem = memo(({ item }: { item: any }) => {
  if (item.hasDropdown) {
    return (
      <NavigationMenuTrigger className="hover:none hover:bg-transparent [direction:rtl]">
        <div className="flex flex-row-reverse items-center justify-center">
          <span className="font-bold text-[#475467] text-base text-left tracking-[0] leading-6 whitespace-nowrap">
            {item.label}
          </span>
        </div>
      </NavigationMenuTrigger>
    );
  }

  return (
    <div className="px-0 py-1">
      <div className="flex items-center justify-center flex-row-reverse">
        <NavLink
          to={item.path}
          className="mt-[-1.00px] font-bold text-[#475467] text-base text-left tracking-[0] leading-6 whitespace-nowrap"
        >
          {item.label}
        </NavLink>
      </div>
    </div>
  );
});

NavigationItem.displayName = 'NavigationItem';

// Memoized mobile navigation item
const MobileNavigationItem = memo(({ item, onToggle }: { item: any; onToggle: () => void }) => (
  <NavLink
    key={item.id}
    to={item.path}
    onClick={onToggle}
    className="py-3 text-right font-bold text-[#475467] text-base"
  >
    {item.label}
  </NavLink>
));

MobileNavigationItem.displayName = 'MobileNavigationItem';


function DashboardNav() {
  const navigate = useNavigate();
  const navigation = useNavigation();

  const rootData = useRouteLoaderData<any>("root");
  const user = rootData?.user;
  const notifications = rootData?.notifications || [];
  const unreadCount = rootData?.unreadCount || 0;

  const [isMenuOpen, toggleMenu] = useReducer((st) => !st, false);

  // Memoized menu items - these rarely change
  const menuItems = useMemo(() => [
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
      requiredRole: "admin",
    },
    {
      id: 5,
      label: "المشرف",
      path: "/supervisor/allTrainers",
      hasDropdown: false,
      requiredRole: "SUPERVISOR",
    },
    {
      id: 2,
      label: "المدربة",
      path: "/dashboard/trainer/trainerProfile",
      hasDropdown: false,
      requiredRole: "user",
    },
    { id: 1, label: "الرئيسة", path: "/", hasDropdown: false },
  ], []);

  // Memoized filtered menu items based on user role
  const visibleMenuItems = useMemo(() => 
    menuItems.filter(
      (item) =>
        !item?.requiredRole ||
        (user &&
          user?.role &&
          user?.role?.toLowerCase() === item?.requiredRole?.toLowerCase())
    )
  , [menuItems, user?.role]);

  // Optimized handlers
  const handleLogout = useCallback(() => {
    if (isMenuOpen) toggleMenu();
    navigate("/logout");
  }, [navigate, isMenuOpen]);

  const handleJoin = useCallback(() => {
    navigate("/join");
  }, [navigate]);

  const handleLogin = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  // Memoized auth actions component
  const AuthActions = useMemo(() => {
    if (!user) {
      return (
        <div className="visitors flex flex-auto justify-end gap-x-4">
          <button
            type="button"
            onClick={handleJoin}
            className="button font-bold text-xs md:text-sm text-center p-3 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
          >
            انضمام
          </button>
          <button
            type="button"
            onClick={handleLogin}
            className="button font-bold text-xs md:text-sm text-center p-3 rounded-lg text-gray-700 hover:bg-black/5 transition-all"
          >
            دخول
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4 flex-row">
        <div className="flex items-start gap-1 [direction:rtl]">
          <button 
            type="button"
            className="flex w-10 items-center justify-center p-2 rounded-md overflow-hidden hover:bg-gray-100 transition-colors"
            aria-label="بحث"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
          <button 
            type="button"
            className="flex w-10 items-center justify-center p-2 rounded-md overflow-hidden hover:bg-gray-100 transition-colors"
            aria-label="إعدادات"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          <NotificationDropdown 
            messages={notifications} 
            unreadCount={unreadCount} 
          />
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-10 items-center justify-center p-2 rounded-md overflow-hidden hover:bg-red-100 transition-colors"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }, [user, handleJoin, handleLogin, handleLogout, notifications, unreadCount]);

  return (
    <header
      className="w-full flex justify-center bg-white border-b border-[#e9e9eb] fixed top-0 left-0 right-0 z-50"
      dir="rtl"
    >
      <div className="max-w-full h-[72px] items-center justify-between w-full flex py-0 lg:px-[112px] max-lg:px-[62px]">
        {/* Mobile menu button (hidden on desktop) */}
        <button 
          type="button"
          className="md:hidden p-2" 
          onClick={toggleMenu}
          aria-label="قائمة التنقل"
          aria-expanded={isMenuOpen}
        >
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
              alt="شعار يانعة"
              src={yaniaLogo}
            />
          </div>

          {/* Desktop navigation (hidden on mobile) */}
          <NavigationMenu className="max-w-none hidden md:block">
            <NavigationMenuList className="flex items-center gap-6">
              {visibleMenuItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  <NavigationItem item={item} />
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Left side - User profile and utility icons (hidden on mobile) */}
        <div className="md:block">
          {AuthActions}
        </div>

        {/* Mobile menu (shown when isMenuOpen is true) */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-40 mt-[72px] overflow-y-auto">
            <div className="flex flex-col p-6 space-y-4">
              {visibleMenuItems.map((item) => (
                <MobileNavigationItem
                  key={item.id}
                  item={item}
                  onToggle={toggleMenu}
                />
              ))}
              <div className="pt-4"></div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default memo(DashboardNav);