import { useLocation } from "@remix-run/react";
import React from "react";
import Logo from "~/assets/images/logo.svg";

const Status = ({ status }: { status: string }) => {
  switch (status) {
    case "denied":
      return (
        <h4 className="text-primary font-bold my-12">
          نعتذر منك٫فلست مخولًا لدخول الصفحة نظرًا لرفض طلبك للانضمام من قبل
          إدارة البرنامج
        </h4>
      );
    case "idle":
      return (
        <h4 className="text-primary font-bold my-12">
          نعتذر منك٫فلست مخولًا لدخول الصفحة نظرًا لعدم تفعيل حسابك
        </h4>
      );

    case "pending":
      return (
        <h4 className="text-primary font-bold my-12">
          لقد قمت بإرسال طلب الانضمام بالفعل٫ نرجو منك الانتظار حتى نقوم بتقييم
          طلبك
        </h4>
      );

    default:
      return (
        <h4 className="text-primary font-bold my-12">
          نعتذر منك فأنت غير مخول للدخول إلى هذه الصفحة
        </h4>
      );
  }
};
const Unauthorized = () => {
  const location = useLocation();
  const status = location.search.split("=")[1];

  return (
    <section className="bg-section h-screen flex flex-col justify-center items-center p-12">
      <img height={150} width={150} src={Logo} alt="logo" />

      {status ? (
        <Status status={status} />
      ) : (
        <h4 className="text-primary font-bold my-12">
          نعتذر منك فأنت غير مخول للدخول إلى هذه الصفحة
        </h4>
      )}
    </section>
  );
};
export default Unauthorized;
