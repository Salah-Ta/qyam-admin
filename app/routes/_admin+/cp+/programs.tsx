// import ProgramContainer from "~/components/programContainer";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";
import programDB from "~/db/program/program.server";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { Program } from "~/types/types";
import { createToastHeaders } from "~/lib/toast.server";
import glossary from "~/lib/glossary";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useState } from "react";
import { Input } from "~/components/ui/input";
export async function loader({ context }: LoaderFunctionArgs) {
  try {
    const programs = await programDB.getAllPrograms(
      context.cloudflare.env.DATABASE_URL
    );
    return Response.json({ success: true, programs });
  } catch (error) {
    return Response.json({ success: false, error });
  }
}
type EditMode = "CREATE" | "UPDATE" | "DELETE";
export async function action({ request, context }: ActionFunctionArgs) {
  let successMsg = "تمت إضافة البرنامج بنجاح";
  let failureMsg = "حدث خطأ أثناء إضافة البرنامج";
  try {
    const formData = await request.formData();
    // console.log({
    //   title: formData.get("title") as string,
    //   link: formData.get("link") as string,
    //   description: formData.get("description") as string,
    //   image: formData.get("image") as string,
    // });

    switch (request.method) {
      case "POST":
       await  programDB
          .createProgram(
            {
              title: formData.get("title") as string,
              link: formData.get("link") as string,
              description: formData.get("description") as string,
              image: formData.get("image") as string,
            },
            context.cloudflare.env.DATABASE_URL
          )
          .then(() => {
            
            successMsg = "تمت إضافة البرنامج بنجاح";
          })
          .catch(() => {
            failureMsg = "حدث خطأ أثناء إضافة البرنامج";
            throw new Error(failureMsg);
            
          });
        break;
      case "UPDATE":
        programDB
          .updateProgram(
            {
              id: formData.get("id") as string,
              title: formData.get("title") as string,
              link: formData.get("link") as string,
              description: formData.get("description") as string,
              image: formData.get("image") as string,
            },
            context.cloudflare.env.DATABASE_URL
          )
          .then(() => {
            successMsg = "تم تحديث البرنامج بنجاح";
          })
          .catch(() => {
            failureMsg = "حدث خطأ أثناء تحديث البرنامج";

            throw new Error(failureMsg);

          });

        break;
      case "DELETE":
        
        await programDB
          .deleteProgram(
            formData.get("id") as string,
            context.cloudflare.env.DATABASE_URL
          )
          .then(() => {
            successMsg = "تم حذف البرنامج بنجاح";
          })
          .catch(() => {
            failureMsg = "حدث خطأ أثناء حذف البرنامج";
            throw new Error(failureMsg);
            
          });
          break;
    }

    return Response.json(
      { success: true },
      {
        headers: await createToastHeaders({
          description: "",
          title: successMsg,
          type: "success",
        }),
      }
    );
  } catch (error) {
    console.error("Loader error:", error);
    Response.json(
      { success: true },
      {
        headers: await createToastHeaders({
          description: "",
          title: failureMsg,
          type: "error",
        }),
      }
    );
  }
}

async function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

const Programs = () => {
  const fetcher = useFetcher();
  const { programs } = useLoaderData<any>();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [selecteImage, setSelectedImage] = useState("");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64String = (await getBase64(file)) as string;
      setSelectedImage(base64String);
    }
  };

   const addProgram = ()=>{
    fetcher.submit(
      {
        title,
        link,
        description: "",
        image: selecteImage,
      },
      { method: "POST" }
    );

   }

   const removeProgram = (program:Program)=>{
    fetcher.submit(
      {
        id:program.id!,
     
      },
      { method: "DELETE" }
    );
    

   }
   const updateProgram = (program:Program)=>{

   }

  return (
    <div>
      <div className="flex sm:flex-row flex-col justify-between items-center px-12 mb-8">
        <h5 className="text-primary font-bold">البرامج</h5>
        <Dialog>
          <DialogTrigger asChild>
            <Button>إضافة برنامج جديد</Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="text-right w-full">
            <DialogHeader className=" mt-4  ml-auto">
              <DialogTitle className="text-right">
                إضافة برنامج جديد{" "}
              </DialogTitle>
              <DialogDescription>
                أضف برنامجًا جديدًا إلى مركز المعرفة
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  عنوان البرنامج
                </label>
                <Input
                  id="name"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="username" className="text-right">
                  رابط البرنامج
                </label>
                <Input
                  id="username"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="image" className="text-right">
                  صورة البرنامج
                </label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="col-span-3"
                />
              </div>
              {selecteImage && (
                <div className="col-span-4">
                  <img
                    src={selecteImage}
                    alt="Preview"
                    className="w-32 h-32 object-cover"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  disabled={!title || !link}
                  onClick={addProgram}
                >
                  إضافة{" "}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>






      </div>
      {/* <ProgramContainer editable={true} onDelete={removeProgram} onEdit={updateProgram} programs={programs.data} /> */}
    </div>
  );
};

export default Programs;
