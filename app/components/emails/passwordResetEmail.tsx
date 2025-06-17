// import { lazy } from "react";
// const Font = ({
//   webFont,
//   fontStyle = "normal",
//   fontFamily,
//   fontWeight = 400,
//   fallbackFontFamily,
// }: any) => {
//   const src = webFont
//     ? `src: url(${webFont.url}) format(${webFont.format});`
//     : "";

//   return (
//     <style>
//       {`
//           @font-face {
//               font-style: ${fontStyle};
//               font-family: ${fontFamily};
//               font-weight: ${fontWeight};
//               mso-font-alt: ${
//                 Array.isArray(fallbackFontFamily)
//                   ? fallbackFontFamily[0]
//                   : fallbackFontFamily
//               };
//               ${src}
//           }

//           * {
//               font-family: ${fontFamily}, ${
//         Array.isArray(fallbackFontFamily)
//           ? fallbackFontFamily.join(", ")
//           : fallbackFontFamily
//       };
//           }
//           `}
//     </style>
//   );
// };
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

// const Html = lazy(async () => {
//   return { default: (await import("@react-email/components")).Html };
// });
// const Head = lazy(async () => {
//   return { default: (await import("@react-email/components")).Head };
// });

// interface PasswordResetEmailProps {
//   resetUrl: string;
// }

// export default function PasswordResetEmail({
//   resetUrl,
// }: PasswordResetEmailProps) {
//   return (
//     <Html dir="rtl">
//       <Head>
//         <meta name="x-apple-disable-message-reformatting" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />

//         <Font
//           fontFamily="notosansarabic"
//           fallbackFontFamily="Verdana"
//           webFont={{
//             url: "https://fonts.gstatic.com/s/notosansarabic/v28/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4rqxzLI.woff2",
//             format: "woff2",
//           }}
//           fontWeight={400}
//           fontStyle="normal"
//         />
//       </Head>

//       <Container>
//         <Body style={{ backgroundColor: "#f3f4f6", fontFamily: "sans-serif" }}>
//           <Container style={{ margin: "0 auto", padding: "2rem 1rem" }}>
//             <Container>
//               <table style={{ width: "100%" }}>
//                 <tr>
//                   <td style={{ textAlign: "center", padding: "16px" }}>
//                     <img
//                       style={{
//                         width: "176px",
//                         height: "176px",
//                       }}
//                       src="https://admin.qyam.org/images/pngLogo.png"
//                       alt=""
//                     />
//                   </td>
//                 </tr>
//               </table>
//             </Container>
//             <Container
//               style={{
//                 width: "100%",
//                 backgroundColor: "#0D3151",
//                 borderRadius: "0.5rem",
//               }}
//             ></Container>
//             <Section
//               style={{
//                 backgroundColor: "white",
//                 borderRadius: "0.5rem",
//                 boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
//                 padding: "2rem",
//               }}
//             >
//               <div>
//                 <Text
//                   style={{
//                     fontSize: "1.5rem",
//                     textAlign: "center",
//                     fontWeight: "bold",
//                     color: "#0D3151",
//                     marginBottom: "1rem",
//                   }}
//                 >
//                   إعادة تعيين كلمة المرور
//                 </Text>

//                 <Text
//                   style={{
//                     color: "#4B5563",
//                     textAlign: "center",
//                     marginBottom: "1.5rem",
//                   }}
//                 >
//                   لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. اضغط على
//                   الزر أدناه لإعادة تعيينها.
//                 </Text>

//                 <a
//                   style={{
//                     backgroundColor: "#0D3151",
//                     color: "white",
//                     paddingLeft: "1.5rem",
//                     paddingRight: "1.5rem",
//                     paddingTop: "0.75rem",
//                     paddingBottom: "0.75rem",
//                     marginBottom: "3rem",
//                     borderRadius: "0.375rem",
//                   }}
//                   href={resetUrl}
//                 >
//                   إعادة تعيين كلمة المرور
//                 </a>
//               </div>
//             </Section>

//             <table style={{ width: "100%" }}>
//               <tr>
//                 <td style={{ textAlign: "center", padding: "16px" }}>
//                   <img
//                     style={{
//                       width: "112px",
//                       height: "73px",
//                     }}
//                     src="https://admin.qyam.org/images/coloreddrop.png"
//                     alt=""
//                   />
//                 </td>
//               </tr>
//             </table>
//             <table style={{ width: "100%" }}>
//               <tr>
//                 <td style={{ textAlign: "center", padding: "16px" }}>
//                   <img
//                     style={{
//                       width: "100%",
//                       height: "100px",
//                     }}
//                     src="https://admin.qyam.org/images/clipPath.png"
//                     alt=""
//                   />
//                 </td>
//               </tr>
//             </table>
//             <div style={{ backgroundColor: "white" }}>
//               <table style={{ width: "100%" }}>
//                 <tr>
//                   <td style={{ textAlign: "center", padding: "16px" }}>
//                     <img
//                       style={{
//                         width: "100%",
//                         height: "70px",
//                       }}
//                       src="https://admin.qyam.org/images/allPartners.png"
//                       alt=""
//                     />
//                   </td>
//                 </tr>
//               </table>
//               <div
//                 style={{
//                   height: "2px",
//                   width: "100%",
//                   display: "flex",
//                   justifyContent: "space-between",
//                   backgroundColor: "#0D3151",
//                 }}
//               ></div>
//               <span
//                 style={{
//                   color: "#0D3151",
//                   fontSize: "0.75rem",
//                 }}
//               >
//                 © جميع الحقوق محفوظة لجمعية أفاق الخفجي.
//               </span>
//             </div>
//           </Container>
//         </Body>
//       </Container>
//     </Html>
//   );
// }
