import QrCode from "qrcode";
import { LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const text = "أحمد الجميل جدا";
  const contactNumber = context.cloudflare.env.CONTACT_NUMBER;
  const whatsappURL = `https://wa.me/${contactNumber}?text=${text}`;

  try {
    const generatedQRCode = await QrCode.toDataURL(whatsappURL);
    return Response.json({ generatedQRCode });
  } catch (error) {
    return Response.json({ generatedQRCode: null });
  }
}


export default function QrCode(){
    return(
        <div>
            here should be qr
        </div>
    )
} 