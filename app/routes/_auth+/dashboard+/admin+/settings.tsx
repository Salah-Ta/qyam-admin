import { MinusCircleIcon, PlusCircleIcon, UserPlusIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "~/routes/_auth+/new-design/components/ui/button";
import {
  Card,
  CardContent,
} from "~/routes/_auth+/new-design/components/ui/card";
import { Input } from "~/routes/_auth+/new-design/components/ui/input";
import plusImg from "./assets/plus.svg";
import HorizontalTabs from "./horizontalTabs";

const ManageData = () => {
  // State for sections and inputs
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "إضافة منطقة",
      buttonText: "حفظ",
      icon: <UserPlusIcon className="h-4 w-4" />,
      inputs: [""], // Initial input field
      disabled: false,
    },
    {
      id: 2,
      title: "إضافة إدارة",
      buttonText: "حفظ",
      icon: <UserPlusIcon className="h-4 w-4" />,
      inputs: [""],
      disabled: false,
    },
    {
      id: 3,
      title: "إضافة مدرسة",
      buttonText: "حفظ",
      icon: <UserPlusIcon className="h-4 w-4" />,
      inputs: [""],
      disabled: false,
    },
  ]);

  // Handler to add a new input field
  const handleAddInput = (sectionId: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? { ...section, inputs: [...section.inputs, ""] }
          : section
      )
    );
  };

  // Handler to remove an input field
  const handleRemoveInput = (sectionId: number, index: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              inputs: section.inputs.filter((_, i) => i !== index),
            }
          : section
      )
    );
  };

  // Handler to save inputs (disable all inputs and change button text)
  const handleSave = (sectionId: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? { ...section, buttonText: "تعديل", disabled: true }
          : section
      )
    );
  };

  // Handler to enable inputs for editing
  const handleEdit = (sectionId: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? { ...section, buttonText: "حفظ", disabled: false }
          : section
      )
    );
  };

  return (
    <div className="  h-full    mb-[423px]">
      <div className="w-full h-full bg-white rounded-2xl border border-solid border-[#d0d5dd]">
        <div className="flex flex-col gap-[46px] lg:p-[42px] max-lg:p-[22px]  items-start">
          {sections.map((section) => (
            <Card
              key={section.id}
              className="w-full flex flex-col items-center justify-center gap-6 p-4 bg-white rounded-xl border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs"
            >
              <div className="flex w-full h-14 items-center justify-center gap-3 p-5 bg-[#006173] rounded-xl shadow-shadows-shadow-xs">
                {/* Buttons Container */}
                <div className="flex flex-1 md:flex-initial gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    className="flex flex-1 md:w-[120px] items-center justify-center gap-1 px-3 py-2 mt-[-10px] mb-[-10px] bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
                    onClick={() =>
                      section.buttonText === "حفظ"
                        ? handleSave(section.id)
                        : handleEdit(section.id)
                    }
                  >
                    <div className="inline-flex items-center justify-center px-0.5 py-0 relative">
                      <div className="relative w-fit mt-[-1px] font-bold text-[#414651] text-sm text-left tracking-[0] leading-5 whitespace-nowrap [direction:rtl]">
                        {section.buttonText}
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-1 md:w-[120px] items-center justify-center gap-1 px-3 py-2 mt-[-10px] mb-[-10px] bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs-skeuomorphic"
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

                {/* Title Section */}
                <div className="flex flex-col items-start gap-0.5 flex-1 grow mt-[-4px] mb-[-4px]">
                  <div className="relative self-stretch mt-[-1px] font-bold text-white text-base tracking-[0] leading-6 [direction:rtl]">
                    {section.title}
                  </div>
                </div>

                {/* Icon Container */}
                <div className="relative w-8 h-8 mt-[-8px] mb-[-8px] bg-white rounded-md overflow-hidden border border-solid border-[#e9e9eb] shadow-shadows-shadow-xs-skeuomorphic max-md:hidden">
                  <div className="absolute w-4 h-4 top-2 left-2">
                    {section.icon}
                  </div>
                </div>
              </div>

              <CardContent className="p-0 w-full">
                <div className="flex flex-col gap-3 w-full">
                  {section.inputs.map((input, index) => (
                    <div key={index} className="w-full [direction:rtl]">
                      <div className="flex items-center gap-2 px-3 py-2 w-full bg-white rounded-lg border border-solid border-[#d5d6d9] shadow-shadows-shadow-xs">
                        <Input
                          className="flex-1 border-none shadow-none   font-normal text-[#717680] text-base tracking-[0] leading-6 [direction:rtl]"
                          placeholder="اكتب المنطقة المراد اضافتها"
                          value={input}
                          disabled={section.disabled} // Disable input if saved
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
                        <PlusCircleIcon
                          className="w-4 h-4 cursor-pointer text-[#A4A7AE]"
                          onClick={() => handleRemoveInput(section.id, index)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageData;
