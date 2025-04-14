export type NavElement = {
    id: string;
    arabicLabel: string;
    link:string,
    visibility: boolean;
    onClick?: () => void;
    children?: NavElement[];
    requiredRole:"admin" | "user" | "all" | "userOnly" |null
  };
export const NavbarElements: NavElement[] = [
    { id: "about",
       arabicLabel: "حول البرنامج", 
      link:"/#about",
        visibility: true,
         onClick() {},
        requiredRole:"all"
      },
      {
        id: "my-account",
        arabicLabel: "حسابي",
        link:"/profile",
        visibility: true,
        onClick() {},
        requiredRole:"userOnly"
      },
      {
        id: "center",
        arabicLabel: "مركز المعرفة",
        link:"center",
        visibility: true,
        onClick() {},
        requiredRole:"userOnly"
      },
    {
      id: "registeration",
      arabicLabel: "شروط التسجيل",
      link:"/join",
      visibility: true,
      onClick() {},
      requiredRole:null

    },
    {
      id: "levels",
      arabicLabel: "مستويات البرنامج",
      link:"/levels",
      visibility: true,
      onClick() {},
      requiredRole:"all"

    },
  
    {
      id: "cp",
      arabicLabel: "لوحة التحكم",
      link:"cp",
      visibility: true,
      onClick() {},
      requiredRole:"admin"
    },
    {
      id: "contact-us",
      arabicLabel: "تواصل معنا",
      link:"contact",
      visibility: true,
      onClick() {},
      requiredRole:"all"
    },
  ];