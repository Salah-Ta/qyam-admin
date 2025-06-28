import React, { useEffect, useState } from "react";
import { Button } from "~/routes/_auth+/new-design/components/ui/button";
import {
  Card,
  CardContent,
} from "~/routes/_auth+/new-design/components/ui/card";
import { Input } from "~/routes/_auth+/new-design/components/ui/input";
import plusImg from "../../../../assets/icons/plus.svg";
import UserIcon from "../../../../assets/icons/user-modified.svg";
import { json } from "@remix-run/cloudflare";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import schoolDB from "~/db/school/school.server";
import eduAdminDB from "~/db/eduAdmin/eduAdmin.server";
import regionDB from "~/db/region/region.server";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { MinusCircleIcon } from "lucide-react";

// --- Loader & Action ---
export async function loader({ context }: LoaderFunctionArgs) {
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const regions = await regionDB.getAllRegions(dbUrl);
  return json({ regions: regions.data, dbUrl });
}

export const action = async ({ request, context }: LoaderFunctionArgs) => {
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const formData = await request.formData();
  const sectionKey = formData.get("sectionKey");
  const names = formData.getAll("regionName");
  const deleteRegionId = formData.get("deleteRegionId");

  try {
    const allRegions = await regionDB.getAllRegions(dbUrl);
    const existingNames = Array.isArray(allRegions.data)
      ? allRegions.data.map((r: any) => r.name)
      : [];

    if (deleteRegionId) {
      try {
        await regionDB.deleteRegion(deleteRegionId as string, dbUrl);
        const regions = await regionDB.getAllRegions(dbUrl);
        return json({ status: "success", regions: regions.data });
      } catch (error: any) {
        return json(
          { status: "error", message: error.message },
          { status: 500 }
        );
      }
    }

    let results = [];
    for (const name of names) {
      if (typeof name === "string" && name.trim() !== "") {
        const fullName = sectionKey + "_" + name;
        if (!existingNames.includes(fullName)) {
          const result = await regionDB.createRegion(fullName, dbUrl);
          results.push(result);
        }
      }
    }

    return json({ status: "success", results });
  } catch (error: any) {
    return json({ status: "error", message: error.message }, { status: 500 });
  }
};

// --- Main Component ---
const SECTION_CONFIG = [
  { id: 1, key: "region", title: "إضافة منطقة" },
  { id: 2, key: "eduAdmin", title: "إضافة إدارة" },
  { id: 3, key: "school", title: "إضافة مدرسة" },
];

const getSectionInputs = (regions: any[], prefix: string) =>
  regions
    .filter((region) => region?.name?.startsWith(prefix + "_"))
    .map((region) => ({
      id: region.id,
      name: region.name.replace(prefix + "_", ""),
    }));

export const ManageData = (): JSX.Element => {
  const data = useLoaderData() as { regions: any[]; dbUrl: string };
  const [sections, setSections] = useState(() =>
    SECTION_CONFIG.map((section) => ({
      ...section,
      buttonText: "حفظ",
      icon: UserIcon,
      inputs: getSectionInputs(data.regions, section.key),
      disabled: false,
    }))
  );

  useEffect(() => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        inputs: getSectionInputs(data.regions, section.key),
      }))
    );
  }, [data.regions]);

  const handleAddInput = (sectionId: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? { ...section, inputs: [...section.inputs, { name: "" }] }
          : section
      )
    );
  };

  return (
    <div className="h-full mb-[423px]">
      <div className="w-full h-full bg-white rounded-2xl border border-solid border-[#d0d5dd]">
        <div className="flex flex-col gap-[46px] lg:p-[42px] max-lg:p-[22px]  items-start">
          {sections.map((section) => (
            <Card
              key={section.id}
              className="w-full flex flex-col items-center justify-center gap-6 p-4 bg-white rounded-xl border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs"
            >
              <Form method="post" className="w-full">
                <input type="hidden" name="sectionKey" value={section.key} />
                <div className="flex w-full h-14 items-center justify-center gap-3 p-5 bg-[#006173] rounded-xl shadow-shadows-shadow-xs">
                  <div className="flex flex-1 md:flex-initial gap-2 w-full md:w-auto">
                    <Button
                      type="submit"
                      variant="outline"
                      className="flex flex-1 md:w-[120px]  items-center justify-center gap-1 px-3 py-2 mt-[-10px] mb-[-10px] bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                      disabled={section.disabled}
                    >
                      <span className="relative w-fit mt-[-1px] font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                        {section.buttonText}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex flex-1 md:w-[120px] items-center justify-center gap-1 px-3 py-2 mt-[-10px] mb-[-10px] bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                      onClick={() => handleAddInput(section.id)}
                    >
                      <span className="relative w-fit mt-[-1px] mr-2 font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                        إضافة
                      </span>
                      <img src={plusImg} alt="plus Logo" />
                    </Button>
                  </div>
                  <div className="flex flex-col items-start gap-0.5 flex-1 grow mt-[-4px] mb-[-4px]">
                    <span className="relative self-stretch mt-[-1px] font-bold text-white text-base tracking-[0] leading-6 [direction:rtl]">
                      {section.title}
                    </span>
                  </div>
                  <div className="relative w-8 h-8 mt-[-8px] mb-[-8px] bg-white rounded-md overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic max-md:hidden">
                    <div className="absolute w-4 h-4 top-2 left-2">
                      <img src={section.icon} alt="" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-0 w-full mt-3">
                  <div className="flex flex-col gap-3 w-full">
                    {section.inputs.map((input, index) => (
                      <div key={index} className="w-full [direction:rtl]">
                        <div className="flex items-center gap-2 px-3 py-2 w-full bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
                          <Input
                            className="flex-1 border-none shadow-none font-normal text-[#717680] text-base tracking-[0] leading-6 [direction:rtl]"
                            placeholder="اكتب المنطقة المراد اضافتها"
                            name="regionName"
                            value={input.name}
                            disabled={section.disabled}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSections((prevSections) =>
                                prevSections.map((s) =>
                                  s.id === section.id
                                    ? {
                                        ...s,
                                        inputs: s.inputs.map((inp, i) =>
                                          i === index
                                            ? { ...inp, name: value }
                                            : inp
                                        ),
                                      }
                                    : s
                                )
                              );
                            }}
                          />
                          <button
                            type="submit"
                            name="deleteRegionId"
                            value={input?.id}
                          >
                            <MinusCircleIcon className="w-4 h-4 cursor-pointer text-[#A4A7AE]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Form>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageData;
