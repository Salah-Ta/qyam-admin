import { createId } from "@paralleldrive/cuid2";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  unstable_parseMultipartFormData,
} from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useCallback, useReducer, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Icon } from "~/components/icon";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";

import userDB from "~/db/user/user.server";
import { LEVELS } from "~/lib/constants";
import { createToastHeaders } from "~/lib/toast.server";
import { UserCertificate } from "~/types/types";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const userId = params.id;
  if (userId)
    return userDB
      .getUserWithCertificates(userId, context.cloudflare.env.DATABASE_URL)
      .then((res: any) => {
        return res.data;
      })
      .catch((error) => {
        return error;
      });

  return null;
}

export async function action({ request, context, params }: ActionFunctionArgs) {
  const uploadHandler = async (props: any) => {
    const { data, filename, contentType } = props;
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
        const userId = params.id;
        if (userId) {
          return userDB
            .addCertificateToUser(
              {
                userId,
                certificateKey: key,
                size: file1.size,
                contentType,
                name: filename,
              },
              context.cloudflare.env.DATABASE_URL
            )
            .then((res) => {
              return res;
            })
            .catch((err) => {
              throw new Error("FAILED_ADD_USER_CERTS");
            });
        }
      })
      .catch((err) => {
        return null; // This hides the actual error
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
            title: `تم رفع شهادات  المتدرب بنجاح`,
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
            title: `فشلت عملية رفع شهادات  المتدرب`,
            type: "error",
          }),
        }
      );
    }
  } else {
    const formData = await request.formData();
    if (formData.get("level")) {
      return userDB
        .updateUserLevel(
          formData.get("id") as string,
          formData.get("level") as any,
          context.cloudflare.env.DATABASE_URL
        )
        .then(async () => {
          return Response.json(
            { success: true },
            {
              headers: await createToastHeaders({
                description: "",
                title: `تم تحديث مستوى المستخدم بنجاح   `,
                type: "success",
              }),
            }
          );
        })
        .catch(async () => {
          return Response.json(
            { success: false },
            {
              headers: await createToastHeaders({
                description: "",
                title: `حدث خطأ أثناء تحديث مستوى المستخدم  `,
                type: "error",
              }),
            }
          );
        });
    } else {
      return userDB
        .updateTrainingInfo(
          {
            trainingHours: Number(formData.get("trainingHours")),
            noStudents: Number(formData.get("noStudents")),
            id: formData.get("id"),
          },
          context.cloudflare.env.DATABASE_URL
        )
        .then(async (res) => {
          return Response.json(
            { success: true },
            {
              headers: await createToastHeaders({
                description: "",
                title: `تم تحديث معلومات المستخدم بنجاح   `,
                type: "success",
              }),
            }
          );
        })
        .catch(async (error) => {
          return Response.json(
            { success: false },
            {
              headers: await createToastHeaders({
                description: "",
                title: `حدث خطأ أثناء تحديث بيانات المستخدم  `,
                type: "error",
              }),
            }
          );
        });
    }
  }
}
const User = () => {
  const user = useLoaderData<any>();
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const fetcher = useFetcher();
  const [isEditMode, toggleEditMode] = useReducer((st) => !st, false);
  const [noTrainHours, setNoTrainHours] = useState(user.trainingHours);
  const [noStudents, setNoStudents] = useState(user.noStudents);
  const [level, setLevel] = useState(user.level);

  const removeFileFromSelection = (file: any) => {
    setSelectedFiles(selectedFiles.filter((f) => file.path !== f.path));
  };

  const uploadCertificates = async () => {
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    fetcher.submit(formData, {
      method: "POST",
      encType: "multipart/form-data",
    });
  };

  const updateUserLevel = () => {
    const formData = new FormData();
    formData.set("id", user.id);

    formData.set("level", level);

    fetcher.submit(formData, {
      method: "POST",
    });
  };

  const updateTrainingInfo = () => {
    const formData = new FormData();
    formData.set("id", user.id);

    formData.set("noStudents", noStudents.toString());
    formData.set("trainingHours", noTrainHours.toString());
    fetcher.submit(formData, {
      method: "POST",
    });
  };

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
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <section className="min-h-screen mb-12">
      <div className="flex p-4 rounded-lg flex-wrap bg-gray-100  mx-auto gap-x-12 gap-y-4 [&>p]:text-sm mb-12 ">
        <h5 className="text-primary flex-[1_0_80%]  font-bold w-full">
          بيانات المستخدم
        </h5>
        <p className="text-[#475467] bg-white border border-[#D0D5DD] rounded-lg p-2 w-72 text-right">
          <span className="text-secondary">الاسم :</span>

          {user.name}
        </p>
        <p className="text-[#475467] bg-white border border-[#D0D5DD] rounded-lg p-2 w-72 text-right">
          <span className="text-secondary"> الإيميل :</span>

          {user.email}
        </p>

        <p className="text-[#475467] bg-white border border-[#D0D5DD] rounded-lg p-2 w-72 text-right">
          <span className="text-secondary"> المنطقة :</span>

          {user.region}
        </p>

        <p className="text-[#475467] bg-white border flex items-center border-[#D0D5DD] rounded-lg p-2 w-72 text-right">
          <span className="text-secondary"> رقم الجوال :</span>
          {user.phone} 966+
        </p>

        <p className="text-[#475467] bg-white border flex gap-x-3 border-[#D0D5DD] rounded-lg p-2 w-72 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full bg-white justify-between">
              <span>{LEVELS[level as keyof typeof LEVELS]}</span>
              {/* <Icon name={"below-arrow"} size="md"/> */}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-6">
              <DropdownMenuRadioGroup value={level} onValueChange={setLevel}>
                {Object.entries(LEVELS).map(([lvl, label]) => (
                  <DropdownMenuRadioItem
                    className={`${level === lvl ? "bg-gray-50" : ""}`}
                    value={lvl}
                  >
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {level !== user.level && (
            <button
              onClick={updateUserLevel}
              className="border border-gray-100 rounded-lg py-1 px-2 hover:bg-gray-50"
            >
              حفظ
            </button>
          )}
        </p>
      </div>

      <div className="rounded-lg mb-12 relative flex-wrap  bg-gray-100 p-4">
        <div className="flex gap-x-4 left-4 top-4 absolute">
          {isEditMode && (
            <button
              onClick={() => {
                updateTrainingInfo();

                toggleEditMode();
              }}
              className=" p-2 bg-primary text-white rounded-md border border-gray-200 "
            >
              حفظ التغييرات
            </button>
          )}
          <button
            onClick={toggleEditMode}
            className=" p-2 bg-white rounded-md border border-gray-200 "
          >
            {isEditMode ? <span>إلغاء </span> : <span>تحرير </span>}
          </button>
        </div>

        <h4 className="mb-8 text-primary  font-bold">إحصائيات المدرب</h4>

        <ul className="flex justify-around w-full">
          <li className="flex flex-col">
            <Icon name="clock" size="xl4" />
            <p className="text-[#475467]  rounded-lg p-2 w-72 text-center">
              ساعات التدريب :
              {isEditMode ? (
                <Input
                max={"9999"}
                  type="number"
                  value={noTrainHours}
                  onChange={(e) => {
                    setNoTrainHours(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{user.trainingHours ?? "0"}</span>
              )}
            </p>
          </li>
          <li className="flex flex-col">
            <Icon name="student" size="xl4" />
            <p className="text-[#475467]  rounded-lg p-2 w-72 text-center">
              عدد المتدربين :
              {isEditMode ? (
                <Input
                max={"9999"}

                  type="number"
                  value={noStudents}
                  onChange={(e) => {
                    setNoStudents(Number(e.target.value));
                  }}
                />
              ) : (
                <span>{user.noStudents ?? "0"}</span>
              )}
            </p>
          </li>
          {/* 
            <li className="flex flex-col">
              <Icon name="course" size="xl4" />
              <p className="text-[#475467] rounded-lg p-2 w-72 text-center">
                المقرر : 0
              </p>
            </li> */}
        </ul>
      </div>

      <div className="rounded-lg  flex-wrap bg-gray-100 p-4">
        <h4 className="font-bold text-primary">شهادات التدريب</h4>

        <div className="border border-gray-100 rounded-lg p-4">
          {user.UserCertificate.length ? (
            <ul>
              <li className="flex  font-bold p-2 w-full my-2  items-center justify-between rounded-lg border border-gray-200 bg-gray-50">
                <span className="w-1/2">{"اسم الملف"}</span>
                <span>{"نوع الملف"}</span>
                <span>{"الحجم "} </span>

                <span>{"التحميل "} </span>
              </li>
              {user.UserCertificate.map((cert: UserCertificate, i: number) => (
                <li
                  key={i}
                  className="flex p-2 w-full my-2  items-center justify-between rounded-lg border border-gray-100 bg-gray-50"
                >
                  <span className="w-1/2">{cert.name}</span>
                  <span>{cert.contentType}</span>
                  <span>{cert.size} بايت</span>

                  <Link
                    className="ml-2 p-2 hover:bg-gray-200 rounded-md transition-all"
                    to={`/download/${cert.certificateKey}`}
                    reloadDocument
                    download={cert.certificateKey}
                  >
                    <Icon name="download" size={"lg"} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">لا توجد شهادات لهذا المستخدم</p>
          )}
        </div>

        <h4 className="font-bold mt-12  text-primary">رفع شهادات التدريب </h4>
        <div
          className="rounded-lg bg-white border cursor-pointer border-[#E4E7EC] w-2/3 mt-12 mx-auto p-5 text-center"
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

            <Button onClick={uploadCertificates} className="mt-4">
              رفع الملفات
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default User;
