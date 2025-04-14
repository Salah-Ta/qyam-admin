import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import ImageZoom from "~/assets/images/zoom.png";
import { Button } from "./ui/button";
import edit from "~/assets/icons/edit.svg"
import { useReducer, useState } from "react";
import DeleteDialoug from "~/routes/_admin+/components/deleteDialog";
import { Program } from "~/types/types";

type Props = {
  programs: any[];
  editable: boolean;
  onEdit?: any;
  onDelete?: any;
};

const ProgramContainer = ({
  programs,
  editable = false,
  onEdit,
  onDelete,
}: Props) => {

  const [deleteDialiug, toggleDeleteDialog] = useReducer(st=>!st,false)
  const [selectedProgram,setSelectedProgram] = useState<Program|null>(null)
  return (
    <div className="flex mx-auto  flex-wrap  gap-x-12 gap-y-6">
      {
        deleteDialiug &&selectedProgram && <DeleteDialoug isOpen={true} onClose={toggleDeleteDialog} onConfirm={onDelete} program={selectedProgram}/>
      }
      {programs.length ? (
        programs.map((program: any) => (
          <Card key={program.id} className="w-[300px]">
            <CardHeader>
              <img
                className="opacity-80 h-[150px]"
                src={program.image ?? ImageZoom}
                alt="image-placeholder"
              />
              <CardTitle className="mt-2"> {program.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{program.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex w-full justify-between">
           {editable&&   <div className="flex gap-2 ">
                {/* <Button
                  variant="outline"
                  className="bg-primary text-white"
                  size="sm"
                  onClick={() => onEdit(program)}
                >
                  تعديل 
                  <img src={edit} alt="" />
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary"
                  onClick={()=>{
                    // console.log("set selected program:  ", program);
                    
                    toggleDeleteDialog()
                    setSelectedProgram(program)
                  
                  }}
                >
                  حذف 
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                  >
                    <path
                      d="M2.5 5.5H4.16667M4.16667 5.5H17.5M4.16667 5.5V17.1667C4.16667 17.6087 4.34226 18.0326 4.65482 18.3452C4.96738 18.6577 5.39131 18.8333 5.83333 18.8333H14.1667C14.6087 18.8333 15.0326 18.6577 15.3452 18.3452C15.6577 18.0326 15.8333 17.6087 15.8333 17.1667V5.5H4.16667ZM6.66667 5.5V3.83333C6.66667 3.3913 6.84226 2.96738 7.15482 2.65482C7.46738 2.34226 7.89131 2.16666 8.33333 2.16666H11.6667C12.1087 2.16666 12.5326 2.34226 12.8452 2.65482C13.1577 2.96738 13.3333 3.3913 13.3333 3.83333V5.5M8.33333 9.66666V14.6667M11.6667 9.66666V14.6667"
                      stroke="#0D3151"
                      stroke-width="1.67"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </Button>
              </div>}
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-900"
                href={program.link}
              >
                {"اضغط هنا"}
              </a>
            </CardFooter>
          </Card>
        ))
      ) : (
        <></>
      )}
    </div>
  );
};

export default ProgramContainer;
