import glossary from "~/lib/glossary";
import {
  Link,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import { LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { QUser } from "~/types/types";
import ProfileImage from "~/assets/images/profile.png";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await getAuthenticated({ request, context });
  if (user && (user as QUser).role === "admin") return Response.json(user);
  return redirect("/");
}

const ControlPanel = () => {
  const user = useLoaderData<any>();
  const location = useLocation();
  const tabs = [
    {
      name: glossary.cp.registered,
      link: "users",
    },
    {
      name: glossary.cp.material,
      link: "material",
    },
    {
      name: glossary.cp.articles,
      link: "articles",
    },
    {
      name: glossary.cp.programs,
      link: "programs",
    },
    {
      name: "المناطق",
      link: "regions",
    },
    {
      name: "الإدارات التعليمية",
      link: "edu-admins",
    },
    {
      name: "المدارس",
      link: "schools",
    },
    {
      name: "التقارير",
      link: "reports",
    },
  ];

  const selectedTabName = tabs.filter((tab) => {
    const path = location.pathname.split("/");
    return path.length >= 3 && tab.link === path[2];
  });

  return (
    <section className="pt-12 md:pt-24 px-8  pb-36 lg:px-44 bg-section min-h-screen">
      <div className="my-6 flex w-full justify-between">
        <div className="">
          <h3>{glossary.cp.control_panel}</h3>

          <div className="flex gap-x-2 my-4">
            <Link to={"/"}>الرئيسية</Link>
            <span>{">"}</span>
            <Link to={"/cp"}>{"لوحة التحكم"}</Link>
            {selectedTabName.length && (
              <>
                <span>{">"}</span>
                <span className="font-bold">{selectedTabName[0].name}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-x-3 items-center">
          <p className="flex flex-col text-sm gap-y-1 text-[#475467]">
            <span className="font-bold ">{user.name}</span>
            <span className="font-bold ">{"مدير النظام"}</span>
          </p>

          <img
            className={"w-16 h-16 border-2 border-[#D0D5DD]  rounded-full"}
            src={ProfileImage}
            alt="profile"
          />
        </div>
      </div>

      <div className="bg-white border border-[#D0D5DD] rounded-xl px-5 py-12 w-full mx-auto">
        <ul className="flex gap-x-4">
          {tabs.map((tab) => (
            <li key={tab.link}>
              <NavLink
                prefetch="viewport"
                className="py-2 px-5 text-center hover:bg-gray-200/50  aria-[current=page]:hover:opacity-90 transition-all  border border-[#D0D5DD] aria-[current=page]:text-white rounded-lg aria-[current=page]:bg-primary"
                to={tab.link}
              >
                {tab.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <hr className="mx-auto  w-full my-12" />

        <Outlet />
      </div>
    </section>
  );
};

export default ControlPanel;
