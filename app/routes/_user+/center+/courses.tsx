import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { Icon } from "~/components/icon";
import materialDB from "~/db/material/material.server";
import { Material } from "~/types/types";

export async function loader({ context }: LoaderFunctionArgs) {
  return materialDB
    .getAllMaterials(context.cloudflare.env.DATABASE_URL)
    .then((res: any) => {
      return Response.json(res.data);
    })
    .catch((err: any) => {
      return null
    });
}

const Courses = () => {
  const materials = useLoaderData<any[]>();
  return (
    <div className="w-full">
      <h4 className="font-bold  text-primary my-4">المناهج</h4>
      <div className="bg-gray-50 rounded-xl p-8 my-6">



      <div className=" rounded-lg p-4">
          {materials.length ? (
            <ul>
          
              {materials.map((m: Material, i: number) => (
                <li
                  key={i}
                  className="flex my-2 p-2 w-full justify-between attachment-container"
                >
                  <span className="w-1/2">{m.title}</span>

                  <div className="flex gap-x-4">

                  <Link
                    className="ml-2 p-2 hover:bg-gray-100 rounded-md transition-all"
                    to={`/download/${m.storageKey}`}
                    reloadDocument
                    download={m.storageKey}
                  >
                    <Icon name="download" size={"lg"} />
                  </Link>
                  </div>            
                </li>
              ))}
            </ul>
          ) : (
            <p>لا توجد مقررات  </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;
