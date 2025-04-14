import { ActionFunctionArgs, LoaderFunctionArgs, unstable_parseMultipartFormData } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {  Material } from "~/types/types";
import { useCallback, useState } from "react";
import { Icon } from "~/components/icon";
import { Button } from "~/components/ui/button";
import { createToastHeaders } from "~/lib/toast.server";
import { createId } from "@paralleldrive/cuid2";
import { useDropzone } from "react-dropzone";
import { sanitizeArabicFilenames } from "~/utils/santize-arabic.filenames";
export async function loader({ request, context, params }: LoaderFunctionArgs) {
  return materialDB
    .getAllMaterials(context.cloudflare.env.DATABASE_URL)
    .then((res: any) => {
      return Response.json(res.data);
    })
    .catch(() => {
      return null
    });
}



export async function action({ request, context }: ActionFunctionArgs) {
  const uploadHandler = async (props: any) => {
    const {  data, filename, contentType } = props;
    const key = `${Date.now()}-${createId()}.${filename.split(".")[1]}`;
    const dataArray1 = [];

    for await (const x of data) {
      dataArray1.push(x);
    }

    const file1 = new File(dataArray1, filename, { type: contentType });
    const buffer = await file1.arrayBuffer();
   return context.cloudflare.env.QYAM_BUCKET.put(key, buffer, {
      httpMetadata: {
        contentType,
      },
    })
      .then(() => {
         return materialDB
            .createMaterial(
              {
                title: filename,
                storageKey: key,
                categoryId: "1",
                published: true
              },
              context.cloudflare.env.DATABASE_URL
            )
            .then((res) => {
              
              return res
            })
            .catch((err) => {
              throw new Error("FAILED_ADD_USER_CERTS");
            });
          }
        )
      .catch((err) => {
        return null
      });
  };
  const contentType = request.headers.get("Content-Type") || "";

  // Handle multipart form data (file uploads)
  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await unstable_parseMultipartFormData(
        request,
        uploadHandler as any
      );
  
      return Response.json(
        { success: true },
        {
          headers: await createToastHeaders({
            description: "",
            title: `تم رفع الملفات  بنجاح`,
            type: "success",
          }),
        }
      );
    } catch (error) {
      console.error("Upload failed:", error);
      return Response.json(
        { success: false },
        {
          headers: await createToastHeaders({
            description: "",
            title: `فشلت عملية رفع  الملفات`,
            type: "error",
          }),
        }
      );
    }



  }



  else {

    try {
const formData = await request.formData()
    return  materialDB.deleteMaterial(formData.get("id") as string,context.cloudflare.env.DATABASE_URL).then(async (res)=>{

      return Response.json(
        { success: true },
        {
          headers: await createToastHeaders({
            description: "",
            title: `تم حذف الملف  بنجاح`,
            type: "success",
          }),
        }
      );

      }).catch(async (e)=>{
        throw new Error("FAILED_DELETE")
       

      })

    }


    catch(e){
      return Response.json(
        { success: false },
        {
          headers: await createToastHeaders({
            description: "",
            title: `فشلت عملية حذف  الملفات`,
            type: "error",
          }),
        }
      );

    }
  }
  
}
const Materials = () => {
  const materials = useLoaderData<any[]>();
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const fetcher = useFetcher();


  const onDrop = useCallback((acceptedFiles: any[]) => {
    // Do something with the files
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {};
      reader.readAsArrayBuffer(file);
    });
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept:{'application/pdf':['.pdf']} });

  const removeFileFromSelection = (file: any) => {
    setSelectedFiles(selectedFiles.filter((f) => file.path !== f.path));
  };

  const deleteMaterial = (id: string) => {
    const formData = new FormData();
    formData.set("id", id)
    fetcher.submit(formData, {
      method: "POST",
    });

  };

  const uploadMaterial = ()=>{
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    })


  }

  return (
    <section className=" px-12 min-h-screen">
      <div>
        <h4 className="font-bold text-primary"> إدارة المقررات</h4>

        <div className="border border-gray-100 rounded-lg p-4">
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
                    download={sanitizeArabicFilenames(m.title)}
                  >
                    <Icon name="download" size={"lg"} />
                  </Link>


                  <button onClick={()=>deleteMaterial(m.id!)} className="p-2 hover:bg-gray-100 rounded-md transition-all">
                  <Icon name="remove" size={"lg"} />


                  </button>

                  </div>

               
                </li>
              ))}
            </ul>
          ) : (
            <p>لا توجد مقررات  </p>
          )}
        </div>

        <h4 className="font-bold mt-12  text-primary">رفع المقررات </h4>
        <div
          className="rounded-lg border cursor-pointer border-[#E4E7EC] w-2/3 mt-12 mx-auto p-5 text-center"
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <div className="bg-gray-50 p-2 w-12 h-12 mx-auto rounded-full">
            <div className="bg-gray-100 p-1 rounded-full text-center">
              <Icon name="download" />
            </div>
          </div>
          {isDragActive ? (
            <p>أفلت الملفات هنا</p>
          ) : (
            <p className="text-sm mt-4">
              <span className="ml-1 text-secondary"> قم بالضغط للتحميل</span> أو
              قم بالسحب والإفلات{" "}
            </p>
          )}
        </div>

        {selectedFiles.length > 0 && (
          <div className="border border-[#E4E7EC] mt-6 rounded-lg p-4">
            <p className="mb-2">الملفات المختارة ({selectedFiles.length})</p>
            <ul>
              {selectedFiles.map((file, i) => (
                <li
                  key={i}
                  className="flex p-2 w-full my-2  items-center justify-between rounded-lg border border-gray-100 bg-gray-50"
                >
                  <span className="w-1/2">
                    {file.relativePath.split("/")[1]}
                  </span>
                  <span className="w-1/3">{file.size} بايت</span>

                  <Button
                    onClick={() => removeFileFromSelection(file)}
                    className="p-1  bg-transparent hover:bg-gray-100 ml-2 px-2"
                  >
                    <Icon name="remove" size="md" />
                  </Button>
                </li>
              ))}
            </ul>

            <Button onClick={uploadMaterial} className="mt-4">
              رفع الملفات
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Materials;
