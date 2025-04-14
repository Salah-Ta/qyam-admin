// import { lazy } from "react";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
// import { Tailwind } from "@react-email/tailwind";
import { Body } from "@react-email/body";
import { Text } from "@react-email/text";
import { Section } from "@react-email/section";
import { Html } from "@react-email/html";
const Font = ({ 
  webFont,
  fontStyle = 'normal',
  fontFamily,
  fontWeight = 400,
  fallbackFontFamily,
}:any) => {
  const src = webFont ? `src: url(${webFont.url}) format(${webFont.format});` : "";

  return (
      <style>
      {
          `
          @font-face {
              font-style: ${fontStyle};
              font-family: ${fontFamily};
              font-weight: ${fontWeight};
              mso-font-alt: ${Array.isArray(fallbackFontFamily) ? fallbackFontFamily[0] : fallbackFontFamily};
              ${src}
          }

          * {
              font-family: ${fontFamily}, ${Array.isArray(fallbackFontFamily) ? fallbackFontFamily.join(", ") : fallbackFontFamily};
          }
          `
      }
      </style>
  )
}
// const Body = lazy(async () => {
//   return { default: (await import("@react-email/components")).Body };
// });

// const Section = lazy(async () => {
//   return { default: (await import("@react-email/components")).Section };
// });

// const Text = lazy(async () => {
//   return { default: (await import("@react-email/components")).Text };
// });

// const Container = lazy(async () => {
//   return { default: (await import("@react-email/components")).Container };
// });


// const Tailwind = lazy(async () => {
//   return { default: (await import("@react-email/components")).Tailwind };
// });

// const Html = lazy(async () => {
//   return { default: (await import("@react-email/components")).Html };
// });
// const Head = lazy(async () => {
//   return { default: (await import("@react-email/components")).Head };
// });


export default function ProgramStatus({name,status}:any) {
  return (

    <Html dir="rtl">
    <Head >
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <Font
        fontFamily="notosansarabic"
        fallbackFontFamily="Verdana"
        webFont={{
          url: "https://fonts.gstatic.com/s/notosansarabic/v28/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4rqxzLI.woff2",
          format: "woff2",
        }}
        fontWeight={400}
        fontStyle="normal"
      />
    </Head>

    <Container>
    <Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
<Container style={{ margin: '0 auto', padding: '2rem 1rem' }}>
  <Container>
    <table style={{ width: "100%" }}>
      <tr>
        <td style={{ textAlign: "center", padding: "16px" }}>
          <img
            style={{
              width: "176px",
              height: "176px",
            }}
            src="https://admin.qyam.org/images/pngLogo.png"
            alt=""
          />
        </td>
      </tr>
    </table>
  </Container>
  <Container style={{ 
    width: '100%', 
    backgroundColor: '#0D3151', 
    borderRadius: '0.5rem' 
  }}>
    {/* <Text style={{ 
      color: '#8BC53F', 
      textAlign: 'center', 
      fontWeight: 'bold', 
      fontSize: '1.25rem' 
    }}>
      {preview}
    </Text> */}
  </Container>
  <Section style={{ 
    backgroundColor: 'white', 
    borderRadius: '0.5rem', 
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
    padding: '2rem' 
  }}>
  <Text style={{
  fontSize: '1.5rem',
  textAlign: 'center',
  fontWeight: 'bold',
  color: '#0D3151',
  marginBottom: '1rem',
  display: status === "accepted" ? "none" : "block"
}}>
  بشأن طلب الالتحاق ببرنامج هندسة القيم
</Text>

<Text style={{
  fontSize: '1rem',
  textAlign: 'center',
  fontWeight: 'bold',
  color: 'black',
  marginBottom: '1rem'
}}>
  عزيزي/عزيزتي {name}،
</Text>

{status === "denied" ? (
  <>
    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'black',
      marginBottom: '1rem'
    }}>
      نشكرك على اهتمامك ببرنامج هندسة القيم وتقديم طلب الالتحاق بنا. لقد تلقينا عددًا كبيرًا من الطلبـــات المؤهــلــة، ممــا جــعــل عملية الاختيار صعبة للغاية.
    </Text>

    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'black',
      marginBottom: '1rem'
    }}>
      بعد دراسة طلبك بعناية، قررنا في هذه المرحلة عدم قبولك في البرنامج. ندرك أن هذا القرار قد يكون مخيباً للآمال، ونود أن نعبر عن تقديرنا لاهتمامك ببرنامجنا.
    </Text>

    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'black'
    }}>
      نحن نؤمن بإمكاناتك ونتمنى لك كل التوفيق في مسيرتك المهنية.
    </Text>

    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#8BC53F',
      marginBottom: '1rem'
    }}>
      مع خالص التحيات، برنامج هندسة القيم
    </Text>
  </>
) : (
  <>
    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'black'
    }}>
      يسعدنا جدًا إخبارك بقبولك في برنامج هندسة القيم. لقد أظهرت سجلك الأكاديمي وخبرتك السابقة اهتمامًا قويًا بهذا المجال،
    </Text>

    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'black'
    }}>
      ونحن على ثقة بأنك ستكون إضافة قيمة لبرنامجنا.
    </Text>

    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'black'
    }}>
      يرجى الاطلاع على التفاصيل الإدارية المتعلقة بالتسجيل والدفع في المرفقات.
    </Text>

    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: 'black'
    }}>
      نتطلع لرؤيتك بيننا.
    </Text>

    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#8BC53F',
      marginBottom: '1rem'
    }}>
      مع خالص التحيات،
    </Text>

    <Text style={{
      fontSize: '1rem',
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#8BC53F',
      marginBottom: '1rem'
    }}>
      برنامج قيم
    </Text>
  </>
)}

     
  </Section>

  <table style={{ width: '100%' }}>
    <tr>
      <td style={{ textAlign: 'center', padding: '16px' }}>
        <img 
          style={{
            width: '112px',
            height: '73px'
          }} 
          src="https://admin.qyam.org/images/coloreddrop.png" 
          alt="" 
        />
      </td>
    </tr>
  </table>
  <table style={{ width: '100%' }}>
    <tr>
      <td style={{ textAlign: 'center', padding: '16px' }}>
        <img 
          style={{
            width: '100%',
            height: '100px'
          }} 
          src="https://admin.qyam.org/images/clipPath.png" 
          alt="" 
        />
      </td>
    </tr>
  </table>
  <div style={{ backgroundColor: 'white' }}>
    <table style={{ width: '100%' }}>
      <tr>
        <td style={{ textAlign: 'center', padding: '16px' }}>
          <img 
            style={{
              width: '100%',
              height: '70px'
            }} 
            src="https://admin.qyam.org/images/allPartners.png" 
            alt="" 
          />
        </td>
      </tr>
    </table>
    <div style={{ 
      height: '2px', 
      width: '100%', 
      display: 'flex', 
      justifyContent: 'space-between', 
      backgroundColor: '#0D3151' 
    }}></div>
    <span style={{ 
      color: '#0D3151', 
      fontSize: '0.75rem' 
    }}>© جميع الحقوق محفوظة لجمعية أفاق الخفجي.</span>
  </div>
</Container>
</Body>
    </Container>
  </Html>

  );
}
