import glossary from "~/lib/glossary";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Program } from "~/types/types";


type TProps = {
    isOpen:boolean, 
    onClose :any, 
    onConfirm:any,
    program:Program
  }
const DeleteDialoug = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    program
  }:TProps)=>{
    const handleConfirm = (e:any) => {
        // console.log("handle confirm");
        
        e.preventDefault();
        onConfirm(program);
      };

   return  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent className="max-w-md">
      <AlertDialogHeader>
        <AlertDialogTitle className="flex  items-center gap-2">
         حذف برنامج
        </AlertDialogTitle>
        <AlertDialogDescription  className="text-right">
        
          
          هل أنت متأكد من حذف البرنامج " {program.title}"؟
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter dir="rtl" className=" gap-x-4  mr-auto">
        <AlertDialogCancel>الالغاء</AlertDialogCancel>
        <button
          onClick={(e)=>{
            handleConfirm(e)
            onClose(e)
          }}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
        >
          التأكيد
        </button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
}


export default DeleteDialoug