import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import rectangle22099 from "../../assets/images/new-design/rectangle-22099.svg";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  return materialDB
    .getAllMaterials(context.cloudflare.env.DATABASE_URL)
    .then((res: any) => {
      return Response.json(res.data);
    })
    .catch(() => {
      return null;
    });
}

export const Trainer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
<div className="flex flex-col w-full max-w-full overflow-hidden">
  {/* Full-width rectangle with fixed 40px height on mobile, original on web */}
  <img 
    alt="Rectangle" 
    src={rectangle22099} 
    className="mt-16 w-full h-40 md:h-auto object-cover"
  />

  <Outlet />
</div>
  );
};

export default Trainer;
