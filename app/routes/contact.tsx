import { Form } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/cloudflare";
import glossary from "~/lib/glossary";
import TitleBlock from "~/components/ui/title-block";
import { sendEmail } from "~/lib/send-email.server";
import { createToastHeaders } from "~/lib/toast.server";


export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  try {
    console.log( `
      الاسم: ${name}
      البريد الإلكتروني: ${email}
      الرسالة: ${message}
    `,);
    
    sendEmail(
      {
        to: context.cloudflare.env.ADMIN_EMAIL,
        subject: "رسالة جديدة من نموذج التواصل",
        text: `
        الاسم: ${name}
        البريد الإلكتروني: ${email}
        الرسالة: ${message}
      `,
      },
      context.cloudflare.env.RESEND_API,
      context.cloudflare.env.MAIN_EMAIL
    );
   
    return Response.json(
      { success: true },
      {
        headers: await createToastHeaders({
          description:"",
          title: glossary.contact.toasts.success,
          type: "success",
        }),
      }
    );
  } catch (error) {
    return Response.json(
      { success: false },
      {
        headers: await createToastHeaders({
          description:"",
          title: glossary.contact.toasts.error,
          type: "error",
        }),
      }
    );
  }
}

export default function Contact() {
  return (
    <section className="pt-48 bg-section min-h-screen">
      <div className="w-4/5 mx-auto">
        <TitleBlock text={glossary?.contact.title} />
        
        <Form method="post" className="mt-12 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {glossary.contact.form.name}
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-2 border bg-white text-black rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {glossary.contact.form.email}
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-2 bg-white text-black border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                {glossary.contact.form.message}
              </label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full p-2 border bg-white text-black rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              {glossary.contact.form.submit}
            </button>
          </div>
        </Form>
      </div>
    </section>
  );
}