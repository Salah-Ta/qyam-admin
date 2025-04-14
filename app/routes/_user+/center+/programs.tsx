import ProgramContainer from "~/components/programContainer";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import programDB from "~/db/program/program.server";
import { useLoaderData } from "@remix-run/react";
import { Program } from "~/types/types";
export async function loader({ context }: LoaderFunctionArgs) {
  try {
    const programs = await programDB.getAllPrograms(
      context.cloudflare.env.DATABASE_URL
    );
    return Response.json({ success: true, programs });
  } catch (error) {
    console.error("Loader error:", error);
    return Response.json({ success: false, error });
  }
}

const Programs = () => {
  const { programs } = useLoaderData<any>();
  return (    <div className="w-full">

  
    <h4 className="font-bold text-primary my-4">البرامج</h4>
    <div className="bg-gray-50 rounded-xl p-8 my-6">
      <ProgramContainer
        role="user"
        programs={programs.data}
        onAddNewProgram={function (program: Program): void {
          throw new Error("Function not implemented.");
        }}
      />
    </div>
    </div>
  );
};

export default Programs;
