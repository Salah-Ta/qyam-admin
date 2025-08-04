import { Resend } from "resend";
import { registerTemplate, resetTemplate, statusTemplate, accountDeactivationTemplate } from "~/components/emails/constants";
// import ProgramStatus from "~/components/emails/programStatus";
// import PasswordResetEmail from "~/components/emails/passwordResetEmail";
// import { render } from "@react-email/render";


let resend: Resend | null = null;

const getResendObject = (key: string) => {
  if (!resend) resend = new Resend(key);
  return resend;
};

type EmailTemplate = "user-registration" | "program-status" | "password-reset" | "contact" | "account-deactivation";

interface SendEmailProps {
  to: string | string[];
  subject: string;
  template: EmailTemplate;
  props?: Record<string, any>;
  text?: string;  // fallback text
}

export const sendEmail = async ({
  to,
  subject,
  template,
  props = {},
  text,
}: SendEmailProps, apiKey: string, sourceEmail: string) => {
  const resend = getResendObject(apiKey);
  let emailComponent="";
  switch (template) {
    case "user-registration":
      emailComponent = registerTemplate(props)
      break;
    case "program-status":
      emailComponent =statusTemplate(props)
      break;
    case "password-reset":
      emailComponent =  resetTemplate(props.resetUrl) 
      break;
    case "account-deactivation":
      emailComponent = accountDeactivationTemplate(props)
      break;
    default:
      throw new Error(`Unknown email template: ${template}`);
  }



  return resend.emails.send({
    from: sourceEmail,
    to,
    subject,
    html:emailComponent,
    text: text || '',
  });
};



type EmailSendBody = {
  to: string|string[];
  subject: string;
  text: string;
};



export const sendBatchEmail= async ( {
  to,
  subject,
  template,
  props = {},
  text,
}: SendEmailProps,
  apiKey: string,
  sourceEmail: string)=>{
    let emailComponent="";
    switch (template) {
      case "program-status":
        emailComponent =statusTemplate
        break;
      case "password-reset":
        emailComponent =  resetTemplate(props.resetUrl) 
        break;
      case "account-deactivation":
        emailComponent = accountDeactivationTemplate
        break;
      default:
        throw new Error(`Unknown email template: ${template}`);
    }
  
    getResendObject(apiKey).batch.send(
      to.map((target:string)=>({
        from: sourceEmail,
        to: target,
        subject,
        html:emailComponent,
        
        
      }))
    );
}