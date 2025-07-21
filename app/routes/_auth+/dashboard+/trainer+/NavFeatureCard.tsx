import { CheckCircleIcon, XCircleIcon, AlertCircleIcon } from "lucide-react";
import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Progress } from "./assets/progress";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import materialDB from "~/db/material/material.server";
import checkIconCercle from "../../../../assets/icons/check-green.svg";

interface ProgressData {
  reportsCompleted: boolean;
  reportsProgress?: number; // Add granular progress for reports
  opinionsCompleted: boolean;
  skillsCompleted: boolean;
}

interface NavFeaturedCardProps {
  progressData?: ProgressData;
}

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

export const NavFeaturedCard = ({ progressData }: NavFeaturedCardProps): JSX.Element => {
  // Data for the checklist items with completion status and progress
  const checklistItems = [
    { 
      id: 1, 
      text: "التقارير", 
      completed: progressData?.reportsCompleted || false,
      inProgress: (progressData?.reportsProgress || 0) > 0 && !progressData?.reportsCompleted,
      progress: progressData?.reportsProgress || 0
    },
    { 
      id: 2, 
      text: "رأي المتدربات", 
      completed: progressData?.opinionsCompleted || false,
      inProgress: false,
      progress: 0
    },
    { 
      id: 3, 
      text: "المهارات", 
      completed: progressData?.skillsCompleted || false,
      inProgress: false,
      progress: 0
    },
  ];

  // Calculate progress percentage with granular reports progress
  const reportsWeight = 1; // Each section has equal weight
  const opinionsWeight = 1;
  const skillsWeight = 1;
  const totalWeight = reportsWeight + opinionsWeight + skillsWeight;

  // Calculate weighted progress
  const reportsProgress = (progressData?.reportsProgress || 0) / 100; // Convert to 0-1 scale
  const opinionsProgress = progressData?.opinionsCompleted ? 1 : 0;
  const skillsProgress = progressData?.skillsCompleted ? 1 : 0;

  const totalProgress = (
    (reportsProgress * reportsWeight) +
    (opinionsProgress * opinionsWeight) +
    (skillsProgress * skillsWeight)
  ) / totalWeight;

  const progressPercentage = Math.round(totalProgress * 100);
  const completedItems = checklistItems.filter(item => item.completed).length;
  const totalItems = checklistItems.length;
  const completedSteps = `${completedItems} من ${totalItems} خطوة`;

  return (
    <Card className="md:w-[286px] max-md:w-full rounded-xl border-[#e9e9eb] shadow-shadows-shadow-xs">
      <CardContent className="flex flex-col items-start gap-4 p-4">
        <div className="flex flex-col items-start gap-3 self-stretch w-full [direction:rtl]">
          <div className="flex  justify-between gap-1 self-stretch w-full [direction:rtl]">
            <div className=" mt-[-1.00px]  font-bold text-[#181d27] text-sm tracking-[0] leading-5 ">
              نسبة إنجاز تقرير اليوم
            </div>

            <div className="w-fit mt-[-1.00px]   font-normal text-[#717680] text-sm text-left tracking-[0] leading-5 whitespace-nowrap ">
              {completedSteps}
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch w-full">
          <div className="w-fit mt-[-1.00px] font-text-sm-medium   text-[#414651]     ">
              {progressPercentage}%
            </div>
            <div className="relative flex-1 grow h-2">
              <Progress className="h-2 bg-[#e9e9eb] rounded-full" value={progressPercentage}>
                <div 
                  className="h-2 bg-[#539c4a] rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </Progress>
            </div>

            
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 self-stretch w-full [direction:rtl]">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center md:justify-end gap-2 self-stretch w-full"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {item.completed ? (
                  <img src={checkIconCercle} alt="CheckCircleIcon" />
                ) : item.inProgress ? (
                  <AlertCircleIcon className="w-5 h-5 text-orange-500" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="w-[204px] mt-[-1.00px]  font-medium text-[#535861] text-sm tracking-[0] leading-5 [direction:rtl]">
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
