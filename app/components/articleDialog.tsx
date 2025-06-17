// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Textarea } from "./ui/textarea";
// import { Article } from "~/types/types";
// import { Form, useFetcher } from "@remix-run/react";
// import {  useEffect, useState } from "react";
// import { Label } from "./ui/label";
// // import type { QuillOptions } from 'quill';
// import "react-quill/dist/quill.snow.css"

// interface ArticleDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   article?: Article | null;
// }



// export default function ArticleDialog({ open, onOpenChange, article }: ArticleDialogProps) {
//   const fetcher = useFetcher();
//   const [selectedImage, setSelectedImage] = useState<File | null>(null);
//   const [ReactQuill,setReactQuill]=useState<any>(null)
//   const [content, setContent] = useState(article?.content || '');
//   const isEditing = !!article;
//   const title = isEditing ? "تعديل المقال" : "إضافة مقال جديد";   


//   useEffect(()=>{
//     import("react-quill").then((module)=>{
//       setReactQuill(()=>module.default)
//     })
//   },[])

//   useEffect(()=>{
//     setContent(article?.content??"")
//   },[article])
  

//     const onChange =async (file:File) => {
//         if(!file)return
//         const fileImage = await getBase64(file) as File
//         setSelectedImage(fileImage)
//         // let base64String = ""
//         // let reader = new FileReader();

//         // reader.onload = function () {
//         //     base64String = reader.result.replace("data:", "")
//         //         .replace(/^.+,/, "");
//         //         setSelectedImage(base64String)
//         //     console.log(base64String);
//         // }
//         // reader.readAsDataURL(file);
//     }

//     async function getBase64(file:File) {
//         return new Promise((resolve, reject) => {
//           const reader = new FileReader();
//           reader.readAsDataURL(file);
//           reader.onload = () => resolve(reader.result);
//           reader.onerror = error => reject(error);
//         });
//       }


//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
    
//     if (selectedImage) {
//       formData.set("image", selectedImage);
//     } else if (article?.image) {
//       formData.set("image", article.image);
//     }
    
//     if (isEditing) {
//       formData.append("id", article.id);
//     }

//     fetcher.submit(formData, {
//       method: isEditing ? "PUT" : "POST",
//     });

//     onOpenChange(false);
//   };




//   const modules:QuillOptions["modules"] = {
//     toolbar:[
//       // [{size:[false,'small','large','huge']}],
//       [{color:[]}],
//       ['bold', 'italic', 'underline'],
//       // [{script:'sub'},{script:'super'}],
//     [{ align: ['', 'center', 'right', 'justify'] }],
//       ["link"],
//       ["clean"],
//     ],
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[100px] md:max-w-[600px] sm:max-h-[800px] overflow-y-scroll">
//         <DialogHeader>
//           <DialogTitle>{title}</DialogTitle>
//         </DialogHeader>
        
//         <Form method="post" encType="multipart/form-data" onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="title">العنوان</Label>
//             <Input
//               id="title"
//               name="title"
//               defaultValue={article?.title}
//               required
              
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="description">الوصف</Label>
//             <Textarea
//               id="description"
//               name="description"
//               defaultValue={article?.description}
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="content">المحتوى</Label>
//             {ReactQuill&&(
//               <ReactQuill
//                 theme="snow"
//                 value={content}
//                 onChange={setContent}
//                 modules={modules}
//                 className=" mb-12 q1-editor"
//                 dir="rtl"
//               />
//             )
//             }
//             <input
//               type="hidden"
//               name="content"
//               value={content}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="image">الصورة</Label>
//             {article?.image && (
//               <img 
//                 src={article.image} 
//                 alt="Current" 
//                 className="w-32 h-32 object-cover mb-2" 
//               />
//             )}
//             <Input
//               id="image"
//               name="image"
//               type="file"
//               accept="image/*"
//               onChange={(e) => onChange(e.target.files[0])}
//             />
//           </div>

//           <div className="flex justify-end gap-2">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => onOpenChange(false)}
//             >
//               إلغاء
//             </Button>
//             <Button type="submit" disabled={fetcher.state === "submitting"}>
//               {fetcher.state === "submitting" 
//                 ? "جاري المعالجة..." 
//                 : isEditing ? "تحديث" : "إضافة"
//               }
//             </Button>
//           </div>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }