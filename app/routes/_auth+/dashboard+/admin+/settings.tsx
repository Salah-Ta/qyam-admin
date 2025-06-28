import { MinusCircleIcon, PlusCircleIcon, UserPlusIcon } from "lucide-react";
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
import { useLoaderData } from "@remix-run/react";
import schoolDB from "~/db/school/school.server";
import eduAdminDB from "~/db/eduAdmin/eduAdmin.server"; // Make sure this path matches your project structure
import regionDB from "~/db/region/region.server"; // Make sure this path matches your project structure
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData } from "@remix-run/react";
import { s } from "node_modules/better-auth/dist/index-Dcbbo2jq";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const regions = await regionDB.getAllRegions(dbUrl);
  const eduAdminsResponse = await eduAdminDB.getAllEduAdmins(dbUrl);

  // const eduAdmin = await eduAdminDB.getAllEduAdmins(dbUrl);
  // const schools = await schoolDB.getAllSchools(dbUrl);
  return json({ regions: regions.data, dbUrl, eduAdminsResponse });
}
export const action = async ({ request, context }: LoaderFunctionArgs) => {
  console.log("ACTION CALLED");

  const dbUrl = context.cloudflare.env.DATABASE_URL;
  const formData = await request.formData();
  const sectionKey = formData.get("sectionKey");
  const names = formData.getAll("regionName");
  const intent = formData.get("intent");
  const deleteRegionId = formData.get("deleteRegionId");
  console.log("names:", names);

  try {
    // Fetch all regions from DB
    const allRegions = await regionDB.getAllRegions(dbUrl);
    const existingNames = Array.isArray(allRegions.data)
      ? allRegions.data.map((r: any) => r.name)
      : [];

    if (deleteRegionId) {
      if (!deleteRegionId) {
        return json(
          { status: "error", message: "Missing region id" },
          { status: 400 }
        );
      }
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
        // Only create if not already in DB
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
export const ManageData = (): JSX.Element => {
  const data = useLoaderData() as { regions: any[]; dbUrl: string }; // Define the type of data returned from loader
  console.log("Data from action:", data); // Log the data returned from the action

  let regionsArray = Array.isArray(data?.regions) ? data?.regions : [];
  const actionData = useActionData() as { regions: any[]; dbUrl: string };
  // State for sections and inputs
  const [sections, setSections] = useState([
    {
      id: 1,
      key: "region",
      title: "إضافة منطقة",
      buttonText: "حفظ",
      icon: UserIcon,
      inputs: structuredClone(
        regionsArray
          .filter((region) => region?.name?.startsWith("region_"))
          .map((region) => {
            return { ...region, name: region?.name.replace("region_", "") };
          })
      ),
      disabled: false,
    },
    {
      id: 2,
      key: "eduAdmin",
      title: "إضافة إدارة",
      buttonText: "حفظ",

      icon: UserIcon,
      inputs: structuredClone(
        regionsArray
          .filter((region) => region?.name?.startsWith("eduAdmin_"))
          .map((region) => {
            return { ...region, name: region?.name.replace("eduAdmin_", "") };
          })
      ),
      disabled: false,
    },
    {
      id: 3,
      key: "school",
      title: "إضافة مدرسة",
      buttonText: "حفظ",
      icon: UserIcon,
      inputs: structuredClone(
        regionsArray
          .filter((region) => region?.name?.startsWith("school_"))
          .map((region) => {
            return { ...region, name: region?.name.replace("school_", "") };
          })
      ),
      disabled: false,
    },
  ]);

  useEffect(() => {
    setSections([
      {
        id: 1,
        key: "region",
        title: "إضافة منطقة",
        buttonText: "حفظ",
        icon: UserIcon,
        inputs: Array.isArray(data.regions)
          ? data.regions
              .filter((region) => region?.name?.startsWith("region_"))
              .map((region) => ({
                id: region.id,
                name: region.name.replace("region_", ""),
              }))
          : [],
        disabled: false,
      },
      {
        id: 2,
        key: "eduAdmin",
        title: "إضافة إدارة",
        buttonText: "حفظ",

        icon: UserIcon,
        inputs: structuredClone(
          regionsArray
            .filter((region) => region?.name?.startsWith("eduAdmin_"))
            .map((region) => {
              return { ...region, name: region?.name.replace("eduAdmin_", "") };
            })
        ),
        disabled: false,
      },
      {
        id: 3,
        key: "school",
        title: "إضافة مدرسة",
        buttonText: "حفظ",
        icon: UserIcon,
        inputs: structuredClone(
          regionsArray
            .filter((region) => region?.name?.startsWith("school_"))
            .map((region) => {
              return { ...region, name: region?.name.replace("school_", "") };
            })
        ),
        disabled: false,
      },
    ]);
  }, [data.regions]);

  // if (actionData) {
  //   regionsArray = Array.isArray(actionData?.regions)
  //     ? actionData?.regions
  //     : [];
  //   setSections((prevSections) =>
  //     prevSections.map((section) => {
  //       if (section.key === "region") {
  //         return {
  //           ...section,
  //           inputs: structuredClone(
  //             regionsArray
  //               .filter((region) => region?.name?.startsWith("region_"))
  //               .map((region) => {
  //                 return {
  //                   ...region,
  //                   name: region?.name.replace("region_", ""),
  //                 };
  //               })
  //           ),
  //         };
  //       } else if (section.key === "eduAdmin") {
  //         return {
  //           ...section,
  //           inputs: structuredClone(
  //             regionsArray
  //               .filter((region) => region?.name?.startsWith("eduAdmin_"))
  //               .map((region) => {
  //                 return {
  //                   ...region,
  //                   name: region?.name.replace("eduAdmin_", ""),
  //                 };
  //               })
  //           ),
  //         };
  //       } else if (section.key === "school") {
  //         return {
  //           ...section,
  //           inputs: structuredClone(
  //             regionsArray
  //               .filter((region) => region?.name?.startsWith("school_"))
  //               .map((region) => {
  //                 return {
  //                   ...region,
  //                   name: region?.name.replace("school_", ""),
  //                 };
  //               })
  //           ),
  //         };
  //       }
  //       return section;
  //     })
  //   );
  // }

  console.log("----------------Action Data:", actionData); // Log the action data

  // Handler to add a new input field
  const handleAddInput = (sectionId: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? { ...section, inputs: [...section.inputs, { name: "" }] }
          : section
      )
    );
  };

  const handleDeleteInput = (
    sections: any,
    selectedSection: any,
    valueToDelete: any
  ) => {
    console.log("Deleting input:", valueToDelete);
    selectedSection.inputs = selectedSection.inputs.filter(
      (input: any) => input.name !== valueToDelete
    );

    // Update the sections state to reflect the deletion
    console.log("Updated sections after deletion:", sections);
    // If you want to remove the section entirely if it has no inputs left, you can do that here
    sections = sections.map((section: any) => {
      if (section.id === selectedSection.id) return selectedSection;
      else return section;
    });

    console.log("sssssssssssssssssssssssssssssssssss:", sections);

    setSections((prevSections) => {
      return sections;
    });
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
              {/* Only wrap the region section in a Form */}

              <Form
                method="post"
                className="w-full"
                // onSubmit={async (e) => {
                //   // Optionally prevent default if you handle the request manually
                //   // e.preventDefault();
                //   // After successful delete (e.g., via fetcher or action response):
                //   handleDeleteInput(section);
                // }}
              >
                <input type="hidden" name="sectionKey" value={section.key} />
                <div className="flex w-full h-14 items-center justify-center gap-3 p-5 bg-[#006173] rounded-xl shadow-shadows-shadow-xs">
                  <div className="flex flex-1 md:flex-initial gap-2 w-full md:w-auto">
                    <Button
                      type="submit"
                      variant="outline"
                      className="flex flex-1 md:w-[120px]  items-center justify-center gap-1 px-3 py-2 mt-[-10px] mb-[-10px] bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                      disabled={section.disabled}
                    >
                      <div className="inline-flex items-center justify-center px-0.5 py-0 relative">
                        <div className="relative w-fit mt-[-1px] font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                          {" "}
                          {section.buttonText}
                        </div>
                      </div>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex flex-1 md:w-[120px] items-center justify-center gap-1 px-3 py-2 mt-[-10px] mb-[-10px] bg-white rounded-md border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                      onClick={() => handleAddInput(section.id)}
                    >
                      <div className="inline-flex items-center justify-center px-0.5 py-0 relative">
                        <div className="relative w-fit mt-[-1px] mr-2 font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                          إضافة
                        </div>
                        <img src={plusImg} alt="plus Logo" />
                      </div>
                    </Button>
                  </div>
                  <div className="flex flex-col items-start gap-0.5 flex-1 grow mt-[-4px] mb-[-4px]">
                    <div className="relative self-stretch mt-[-1px] font-bold text-white text-base tracking-[0] leading-6 [direction:rtl]">
                      {section.title}
                    </div>
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
                                          i === index ? value : inp
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
                            onClick={() => {
                              // Your custom logic here (e.g., show a confirmation dialog)
                              console.log("Button clicked!");
                              // handleDeleteInput(
                              //   sections,
                              //   section,
                              //   input.name
                              // );
                              // Do NOT call event.preventDefault() if you want the form to submit
                            }}
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
