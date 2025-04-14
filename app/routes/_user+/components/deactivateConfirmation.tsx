
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { QUser } from "~/types/types";


type TProps = {
  isOpen:boolean, 
  onClose :any, 
  onConfirm:any,
  user?:QUser,
}

const DeactivateConfirmation = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
  }:TProps) => {
    // Create a handleConfirm function to ensure the event is passed
    const handleConfirm = (e:any) => {
      e.preventDefault();
      onConfirm();
    };
  
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex  items-center gap-2">
                تعطيل الحساب
            </AlertDialogTitle>
            <AlertDialogDescription  className="text-right">
       
              <span>
                هل أنت متأكد من تعطيل حسابك؟ لن تستطيع الوصول إلى  مركز المعرفة بعد اتخاذ هذي الخطوة

              </span>
              
              
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter dir="rtl" className=" gap-x-4  mr-auto">
            <AlertDialogCancel>الالغاء</AlertDialogCancel>
            <button
              onClick={(e)=>{
                handleConfirm(e)
                onClose(e)
              }}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-700 text-white hover:bg-red-800 h-10 px-4 py-2"
            >
              تعطيل
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };



  export default DeactivateConfirmation