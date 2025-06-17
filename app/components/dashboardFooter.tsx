import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../components/UI-dashbord/navigation-menu";
import { Separator } from "../components/UI-dashbord/separator";
import group2 from "../assets/images/new-design/footer-right.svg";
import group from "../assets/images/new-design/footer-left.svg";
// import group2 from "../assets/images/new-design/footer/group-2.png";
import facebookIcon from "../assets/icons/x-social.svg";
import youtubeIcon from "../assets/icons/youtube.svg";

const DashboardFooter = (): JSX.Element => {
  // Footer navigation links data
  const navigationLinks = [
    { id: 1, text: "حول البرنامج" },
    { id: 2, text: "شروط التسجيل" },
    { id: 3, text: "مستويات البرنامج" },
    { id: 4, text: "تواصل معنا" },
    { id: 5, text: "الخصوصية" },
  ];

  // Social media icons data
  const socialIcons = [
    {
      id: 1,
      src: youtubeIcon,
      alt: "Social icon",
    },
    {
      id: 2,
      src: facebookIcon,
      alt: "Social icon",
    },
  ];

  return (
    <div>
      <div className="h-[461px] 
 ">
        <div className="relative w-full h-[461px]  ">
          <footer
            className="flex flex-col w-full items-center gap-16 pt-16 pb-12   bg-[#006173] lg:px-[112px]"
            dir="rtl"
          >
            <div className="flex-col w-full max-w-full  items-start gap-12 flex px-8 py-0 relative ">
              <div className="flex items-start gap-8 self-stretch w-full">
                <div className="flex flex-col items-start gap-8 flex-1 max-md:items-center">
                  {/* Logo and paragraph section - centered on mobile */}
                  <div className="flex flex-col items-end gap-8 max-md:items-center">
                    <div className="relative w-full h-[91.63px] max-md:flex max-md:justify-center max-md:mr-[30px]">
                      <div className="relative w-36 h-[92px]">
                
                        <img
                          className="absolute w-[144px] h-[91px] top-0 left-0"
                          alt="Group"
                          src={group2}
                        />
                      </div>
                    </div>

                    <div className="relative w-[451px] mt-[-1.00px] font-normal text-white text-base tracking-[0] leading-6 [direction:rtl] max-md:text-center max-md:w-full">
                      برنامج نوعي على مستوى المملكة موجه للفتيات، لتمكينهن من
                      تحصيل الساعات التطوعية المحددة لهن كمتطلب تخرج من التعليم
                      العام
                    </div>
                  </div>

                  {/* Navigation - centered on mobile */}
                  <NavigationMenu className="w-full">
                    <NavigationMenuList className="flex flex-col md:flex-row items-end md:items-start gap-4 md:gap-8 w-full">
                      {navigationLinks.map((link) => (
                        <NavigationMenuItem
                          key={link.id}
                          className="w-full md:w-auto text-right"
                        >
                          <NavigationMenuLink className="inline-flex items-center justify-end gap-2 w-full md:w-auto">
                            <div className="inline-flex items-end">
                              <div className="relative w-fit mt-[-1.00px] font-bold text-white text-base tracking-[0] leading-6 whitespace-nowrap [direction:rtl]">
                                {link.text}
                              </div>
                            </div>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      ))}
                    </NavigationMenuList>
                  </NavigationMenu>
                </div>
              </div>
            </div>

            <div className="flex-col w-full  max-w-full  items-start gap-8 flex px-8 py-0 max-md:*:flex-col">
              <Separator className="w-full h-px bg-white" />

              <div className="flex items-center gap-8 self-stretch w-full ">
                <div className="inline-flex items-center gap-6">
                  {socialIcons.map((icon) => (
                    <img
                      key={icon.id}
                      className="relative w-6 h-6"
                      alt={icon.alt}
                      src={icon.src}
                    />
                  ))}
                </div>
                <div className="relative flex-1 mt-[-1.00px] font-normal text-white text-base text-left tracking-[0] leading-6 [direction:rtl]">
                  © جميع الحقوق محفوظة لجمعية رواء العلم.
                </div>
              </div>
            </div>
          </footer>

          <img
            className="absolute w-56 h-[218px] top-[55px] left-[104px] max-md:hidden"
            alt="Group"
            src={group}
          />
        </div>
      </div>
    </div>
  );
};
export default DashboardFooter;
