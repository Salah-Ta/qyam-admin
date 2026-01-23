import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";
import { Outlet, useLocation, useNavigate, useLoaderData } from "@remix-run/react";
import rectangle22099 from "../../assets/images/new-design/rectangle-22099.svg";
import ProfileImage from "../../assets/images/profile.png";
import { getAuthenticated } from "~/lib/get-authenticated.server";
import { QUser } from "~/types/types";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const user = await getAuthenticated({ request, context });

  const materials = await materialDB
    .getAllMaterials(context.cloudflare.env.DATABASE_URL)
    .then((res: any) => res.data)
    .catch(() => null);

  return Response.json({ materials, user });
}

export const Trainer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loaderData = useLoaderData<{ materials: any; user: QUser | null }>();
  const user = loaderData?.user;

  return (
    <div className="flex flex-col w-full max-w-full overflow-hidden">
      {/* Header with profile */}
      <div className="relative">
        {/* Full-width rectangle with fixed 40px height on mobile, original on web */}
        <img
          alt="Rectangle"
          src={rectangle22099}
          className="mt-16 w-full h-40 md:h-auto object-cover"
        />

        {/* Profile Section overlaid on the banner */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
            <div className="flex items-center justify-end gap-4 px-8 lg:px-[112px] [direction:rtl]">
              <div className="flex items-center gap-4 bg-white rounded-xl shadow-lg p-4">
                <img
                  src={user?.image || ProfileImage}
                  className="w-[60px] h-[60px] rounded-full border-2 border-white shadow-md object-cover"
                  alt="profile"
                />
                <div className="flex flex-col items-start gap-1">
                  <div className="font-bold text-base text-[#181d27]">
                    {user?.name || "المشرف"}
                  </div>
                  <div className="font-normal text-sm text-[#535862]">
                    {user?.region || "مشرف"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add padding top to account for the overlapping profile section */}
      <div className={user ? "pt-16" : ""}>
        <Outlet />
      </div>
    </div>
  );
};

export default Trainer;
