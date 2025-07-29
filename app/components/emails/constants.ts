export const resetTemplate =(resetUrl:string)=> `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @font-face {
            font-family: 'notosansarabic';
            src: url('https://fonts.gstatic.com/s/notosansarabic/v28/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4rqxzLI.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }

        /* Add responsive styles */
        @media screen and (max-width: 600px) {
            .outer-container {
                width: 95% !important;
            }
            .inner-table {
                width: 100% !important;
            }
            .logo-image {
                width: 120px !important;
                height: 120px !important;
            }
            .content-padding {
                padding: 1rem !important;
            }
            .main-content {
                padding: 1rem !important;
            }
            .partners-image {
                height: auto !important;
            }
            .colored-drop {
                width: 42px !important;
                height: 27px !important;
            }
        }
    </style>
</head>
<body style="font-family: sans-serif; margin: 0; padding: 0;">
<div class="outer-container" style="width:70%; margin-left:auto; margin-right:auto; background: #D0D7DE1C;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="inner-table" style="width:70%; margin-left:auto; margin-right:auto;">
        <tr>
            <td align="center" class="content-padding" style="padding: 2rem 1rem;">
                <!-- Logo -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 16px;">
                            <img src="https://admin.qyam.org/images/pngLogo.png" alt="" class="logo-image" width="176" height="176" style="display: block; margin: 0 auto;">
                        </td>
                    </tr>
                </table>

                <!-- Blue Container -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0D3151; border-radius: 0.5rem;">
                    <tr>
                        <td style="padding:0.5rem;">
                            <h1 style="color:#8BC53F; text-align: center; margin: 0.5rem 0;">
                                إعادة تعيين كلمة المرور
                            </h1>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); margin-top: 1rem;">
                    <tr>
                        <td class="main-content" style="padding: 2rem;">
                            <p style="color: #4B5563; text-align: center; margin-bottom: 1.5rem; font-size: 1.125rem;">
                                لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر
                                أدناه لإعادة تعيينها.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center">
                                        <a href="${resetUrl}" style="font-size: 1.125rem; background-color: #0D3151; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; margin-bottom: 3rem;">
                                            إعادة تعيين كلمة المرور
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Colored Drop Image -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 16px;">
                            <img src="https://admin.qyam.org/images/coloreddrop.png" alt="" class="colored-drop" width="56" height="36.5" style="display: block; margin: 0 auto;">
                        </td>
                    </tr>
                </table>

                <!-- Clip Path Image -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 16px;">
                            <img src="https://admin.qyam.org/images/clipPath.png" alt="" width="100%" style="display: block; margin: 0 auto; height: auto;">
                        </td>
                    </tr>
                </table>

                <!-- Footer Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: white;">
                    <tr>
                        <td style="text-align: center; padding: 16px;">
                            <img src="https://admin.qyam.org/images/allPartners.png" alt="" class="partners-image" width="600" height="105" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div style="height: 2px; background-color: #0D3151; margin: 1rem 0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; color: #0D3151; font-size: 0.75rem; padding-bottom: 1rem;">
                            © جميع الحقوق محفوظة لجمعية أفاق الخفجي.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
</body>
</html>`


export const statusTemplate = (props: { status: string; name: string }) => `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @font-face {
            font-family: 'notosansarabic';
            src: url('https://fonts.gstatic.com/s/notosansarabic/v28/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4rqxzLI.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }

        /* Add responsive styles */
        @media screen and (max-width: 600px) {
            .outer-container {
                width: 95% !important;
            }
            .inner-table {
                width: 100% !important;
            }
            .logo-image {
                width: 120px !important;
                height: 120px !important;
            }
            .content-padding {
                padding: 1rem !important;
            }
            .main-content {
                padding: 1rem !important;
            }
            .partners-image {
                height: auto !important;
            }
            .colored-drop {
                width: 42px !important;
                height: 27px !important;
            }
        }
    </style>
</head>
<body style="font-family: sans-serif; margin: 0; padding: 0;">
<div class="outer-container" style="width:70%; margin-left:auto; margin-right:auto; background: #D0D7DE1C;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="inner-table" style="width:70%; margin-left:auto; margin-right:auto;">
        <tr>
            <td align="center" class="content-padding" style="padding: 2rem 1rem;">
                <!-- Logo -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 16px;">
                            <img src="https://admin.qyam.org/images/pngLogo.png" alt="" class="logo-image" width="176" height="176" style="display: block; margin: 0 auto;">
                        </td>
                    </tr>
                </table>

                <!-- Blue Container -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0D3151; border-radius: 0.5rem;">
                    <tr>
                        <td style="padding:0.5rem;">
                            <h1 style="color:#8BC53F; text-align: center; margin: 0.5rem 0;">
                                حالة الطلب
                            </h1>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: white; border-radius: 0.5rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); margin-top: 1rem;">
                    <tr>
                        <td class="main-content" style="padding: 2rem;">
                            ${props.status !== "accepted" ? `
                            <h1 style="font-size: 1.5rem; text-align: center; font-weight: bold; color: #0D3151; margin-bottom: 1rem;">
                                بشأن طلب الالتحاق ببرنامج هندسة القيم
                            </h1>
                            ` : ''}

                            <p style="font-size: 1rem; text-align: center; font-weight: bold; color: black; margin-bottom: 1rem;">
                                عزيزي/عزيزتي ${props.name}،
                            </p>

                            ${props.status === "denied" ? `
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: black; margin-bottom: 1rem;">
                                    نشكرك على اهتمامك ببرنامج هندسة القيم وتقديم طلب الالتحاق بنا. لقد تلقينا عددًا كبيرًا من الطلبـــات المؤهــلــة، ممــا جــعــل عملية الاختيار صعبة للغاية.
                                </p>
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: black; margin-bottom: 1rem;">
                                    بعد دراسة طلبك بعناية، قررنا في هذه المرحلة عدم قبولك في البرنامج. ندرك أن هذا القرار قد يكون مخيباً للآمال، ونود أن نعبر عن تقديرنا لاهتمامك ببرنامجنا.
                                </p>
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: black;">
                                    نحن نؤمن بإمكاناتك ونتمنى لك كل التوفيق في مسيرتك المهنية.
                                </p>
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: #8BC53F; margin-bottom: 1rem;">
                                    مع خالص التحيات، برنامج هندسة القيم
                                </p>
                            ` : `
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: black;">
                                    يسعدنا جدًا إخبارك بقبولك في برنامج هندسة القيم. لقد أظهرت سجلك الأكاديمي وخبرتك السابقة اهتمامًا قويًا بهذا المجال،
                                </p>
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: black;">
                                    ونحن على ثقة بأنك ستكون إضافة قيمة لبرنامجنا.
                                </p>
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: black;">
                              ملاحظة: لتتمكن من الدخول الى حسابك في قيم فإنه يتوجب عليك إعادة تعيين كلمة مرورك بخطوات بسيطة عبر الرابط التالي
                               <a href="https://qyam.org/forgot-password" style="font-size: 0.75rem; background-color: #0D3151; color: white; padding: 0.5rem 0.75rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; margin-bottom: 3rem;">
                                            إعادة تعيين كلمة المرور
                                        </a>
                              
                                </p>
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: black;">
                                    نتطلع لرؤيتك بيننا.
                                </p>
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: #8BC53F; margin-bottom: 1rem;">
                                    مع خالص التحيات،
                                </p>
                                <p style="font-size: 1rem; text-align: center; font-weight: bold; color: #8BC53F; margin-bottom: 1rem;">
                                    برنامج قيم
                                </p>
                            `}
                        </td>
                    </tr>
                </table>

                <!-- Colored Drop Image -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 16px;">
                            <img src="https://admin.qyam.org/images/coloreddrop.png" alt="" class="colored-drop" width="56" height="36.5" style="display: block; margin: 0 auto;">
                        </td>
                    </tr>
                </table>

                <!-- Clip Path Image -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 16px;">
                            <img src="https://admin.qyam.org/images/clipPath.png" alt="" width="100%" style="display: block; margin: 0 auto; height: auto;">
                        </td>
                    </tr>
                </table>

                <!-- Footer Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: white;">
                    <tr>
                        <td style="text-align: center; padding: 16px;">
                            <img src="https://admin.qyam.org/images/allPartners.png" alt="" class="partners-image" width="600" height="105" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div style="height: 2px; background-color: #0D3151; margin: 1rem 0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center; color: #0D3151; font-size: 0.75rem; padding-bottom: 1rem;">
                            © جميع الحقوق محفوظة لجمعية أفاق الخفجي.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
</body>
</html>`

export const registerTemplate = (props: { name: string }) => `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @font-face {
            font-family: 'notosansarabic';
            src: url('https://fonts.gstatic.com/s/notosansarabic/v28/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4rqxzLI.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
    </style>
</head>
<body>
    <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
        <h1 style="font-size: 1.5rem; text-align: center;">مرحبًا ${props.name}!</h1>
        <p style="font-size: 1rem; text-align: center;">شكرًا لتسجيلك في خدمتنا.</p>
        <p style="font-size: 1rem; text-align: center;"> سيتم مراجعة طلبك قريبًا.</p>
    </div>
</body>
</html>`

export const userUpdateTemplate = (props: { name: string; status: string }) => `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @font-face {
            font-family: 'notosansarabic';
            src: url('https://fonts.gstatic.com/s/notosansarabic/v28/nwpCtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlj4wv4rqxzLI.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
    </style>
</head>
<body style="font-family: sans-serif; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
        <h1 style="font-size: 1.5rem; text-align: center;">تحديث حالة المستخدم</h1>
        <p style="font-size: 1rem; text-align: center;">مرحبًا ${props.name}،</p>
        <p style="font-size: 1rem; text-align: center;">لقد تم تحديث حالة طلبك إلى: ${props.status}</p>
        ${props.status === 'accepted' ? (
            `<p style="font-size: 1rem; text-align: center;">تهانينا! تم قبول طلبك.</p>`
        ) : props.status === 'denied' ? (
            `<p style="font-size: 1rem; text-align: center;">نأسف، تم رفض طلبك.</p>`
        ) : props.status === 'pending' ? (
            `<p style="font-size: 1rem; text-align: center;">حالة طلبك قيد المراجعة.</p>`
        ) : props.status === 'rejected' ? (
            `<p style="font-size: 1rem; text-align: center;">تم رفض طلبك.</p>`
        ) : props.status === 'idle' ? (
            `<p style="font-size: 1rem; text-align: center;">حالة طلبك غير نشطة.</p>`
        ) : null}
    </div>
</body>
</html>`