export const resetTemplate = (resetUrl: string) => `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @font-face {
            font-family: 'PingARLT';
            src: url('https://fonts.gstatic.com/s/pingarlt/v1/3q8b2f4a5c9d7e6f0c8b2f4a5c9d7e6f.woff2') format('woff2');
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
                width: 50px !important;
                height: 50px !important;
            }
            .content-padding {
                padding: 1rem !important;
            }
            .main-content {
                padding: 1rem !important;
            }
        }
    </style>
</head>
<body style="font-family: 'PingARLT', Verdana, sans-serif; margin: 0; padding: 0; background-color: white;">
<div class="outer-container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="inner-table">
        <tr>
            <td align="center" class="content-padding">
                <!-- Logo Header -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding-bottom: 50px;">
                            <img src="https://admin.qyam.org/images/pngLogo.png" alt="يانعة" class="logo-image" width="70" height="70" style="display: block; margin: 0 auto;">
                        </td>
                    </tr>
                </table>

                <!-- Header Banner -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #006173; border-radius: 0;">
                    <tr>
                        <td style="padding: 15px;">
                            <h1 style="color: #8bc53f; text-align: center; margin: 0; font-weight: bold; font-size: 1.5rem;">
                                إعادة تعيين كلمة المرور
                            </h1>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: white; margin-bottom: 30px;">
                    <tr>
                        <td class="main-content" style="padding: 30px;">
                            <p style="color: #000000; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 16px 0;">
                                لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه لإعادة تعيينها.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td align="center">
                                        <a href="${resetUrl}" style="font-size: 1.125rem; background-color: #006173; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; margin: 20px 0;">
                                            إعادة تعيين كلمة المرور
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Footer Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 0;">
                            <img src="https://images.yaneah.com/Footer.jpg" alt="Footer" width="100%" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
</body>
</html>`;

export const statusTemplate = (props: {
  status: string;
  name: string;
}) => `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @font-face {
            font-family: 'PingARLT';
            src: url('https://fonts.gstatic.com/s/pingarlt/v1/3q8b2f4a5c9d7e6f0c8b2f4a5c9d7e6f.woff2') format('woff2');
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
                width: 50px !important;
                height: 50px !important;
            }
            .content-padding {
                padding: 1rem !important;
            }
            .main-content {
                padding: 1rem !important;
            }
        }
    </style>
</head>
<body style="font-family: 'PingARLT', Verdana, sans-serif; margin: 0; padding: 0; background-color: white;">
<div class="outer-container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="inner-table">
        <tr>
            <td align="center" class="content-padding">
                <!-- Logo Header -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding-bottom: 50px;">
                            <img src="https://admin.qyam.org/images/pngLogo.png" alt="يانعة" class="logo-image" width="70" height="70" style="display: block; margin: 0 auto;">
                        </td>
                    </tr>
                </table>

                <!-- Header Banner -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #006173; border-radius: 0;">
                    <tr>
                        <td style="padding: 15px;">
                            <h1 style="color: #8bc53f; text-align: center; margin: 0; font-weight: bold; font-size: 1.5rem;">
                                حالة الطلب
                            </h1>
                        </td>
                    </tr>
                </table>

                <!-- Subtitle -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="padding: 15px;">
                            <div style="color: #0d3151; text-align: center; font-weight: bold; font-size: 1.5rem; margin: 0;">
                                ${props.status === "accepted" ? "تم قبولك في البرنامج" : props.status === "denied" ? "قرار بشأن طلبك" : "تحديث حالة الطلب"}
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: white; margin-bottom: 30px;">
                    <tr>
                        <td class="main-content" style="padding: 30px;">
                            ${
                              props.status !== "accepted"
                                ? `
                            <h1 style="font-size: 1.5rem; text-align: center; font-weight: bold; color: #0D3151; margin-bottom: 1rem;">
                                بشأن طلب الالتحاق ببرنامج هندسة القيم
                            </h1>
                            `
                                : ""
                            }

                            <p style="color: #000000; font-weight: bold; font-size: 1.13rem; line-height: 1.7; margin: 0; text-align: center;">
                                مرحباً <span style="color: #FF0000;">${props.name}</span>،
                            </p>

                            ${
                              props.status === "denied"
                                ? `
                                <p style="color: #000001; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 16px 0;">
                                    نشكرك على اهتمامك ببرنامج هندسة القيم وتقديم طلب الالتحاق بنا. لقد تلقينا عددًا كبيرًا من الطلبـــات المؤهــلــة، ممــا جــعــل عملية الاختيار صعبة للغاية.
                                </p>

                                <p style="color: #000101; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 24px 0;">
                                    بعد دراسة طلبك بعناية، قررنا في هذه المرحلة عدم قبولك في البرنامج. ندرك أن هذا القرار قد يكون مخيباً للآمال، ونود أن نعبر عن تقديرنا لاهتمامك ببرنامجنا.
                                </p>

                                <p style="color: #000000; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 10px 0;">
                                    نحن نؤمن بإمكاناتك ونتمنى لك كل التوفيق في مسيرتك المهنية.
                                </p>

                                <p style="color: #000000; font-size: 1.13rem; font-weight: bold; text-align: center; margin: 20px 0 0 0;">
                                    مع خالص التحيات،
                                </p>

                                <p style="color: #000000; font-size: 1.13rem; font-weight: bold; text-align: center; margin: 20px 0 0 0;">
                                    برنامج هندسة القيم
                                </p>
                            `
                                : `
                                <p style="color: #000001; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 16px 0;">
                                    يسعدنا جدًا إخبارك بقبولك في برنامج هندسة القيم. لقد أظهرت سجلك الأكاديمي وخبرتك السابقة اهتمامًا قويًا بهذا المجال،
                                </p>

                                <p style="color: #000101; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 24px 0;">
                                    ونحن على ثقة بأنك ستكون إضافة قيمة لبرنامجنا.
                                </p>

                                <p style="color: #000101; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 24px 0;">
                                    ملاحظة: لتتمكن من الدخول الى حسابك في قيم فإنه يتوجب عليك إعادة تعيين كلمة مرورك بخطوات بسيطة عبر الرابط التالي
                                    <a href="https://qyam.org/forgot-password" style="font-size: 0.75rem; background-color: #0D3151; color: white; padding: 0.5rem 0.75rem; border-radius: 0.375rem; text-decoration: none; display: inline-block; margin-bottom: 3rem;">
                                        إعادة تعيين كلمة المرور
                                    </a>
                                </p>

                                <p style="color: #000000; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 10px 0;">
                                    نتطلع لرؤيتك بيننا.
                                </p>

                                <p style="color: #000000; font-size: 1.13rem; font-weight: bold; text-align: center; margin: 20px 0 0 0;">
                                    مع خالص التحيات،
                                </p>

                                <p style="color: #000000; font-size: 1.13rem; font-weight: bold; text-align: center; margin: 20px 0 0 0;">
                                    برنامج قيم
                                </p>
                            `
                            }
                        </td>
                    </tr>
                </table>

                <!-- Footer Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 0;">
                            <img src="https://images.yaneah.com/Footer.jpg" alt="Footer" width="100%" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
</body>
</html>`;

export const registerTemplate = (props: { name: string }) => `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @font-face {
            font-family: 'PingARLT';
            src: url('https://fonts.gstatic.com/s/pingarlt/v1/3q8b2f4a5c9d7e6f0c8b2f4a5c9d7e6f.woff2') format('woff2');
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
                width: 50px !important;
                height: 50px !important;
            }
            .content-padding {
                padding: 1rem !important;
            }
            .main-content {
                padding: 1rem !important;
            }
        }
    </style>
</head>
<body style="font-family: 'PingARLT', Verdana, sans-serif; margin: 0; padding: 0; background-color: white;">
<div class="outer-container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="inner-table">
        <tr>
            <td align="center" class="content-padding">
                <!-- Logo Header -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding-bottom: 50px;">
                            <img src="https://admin.qyam.org/images/pngLogo.png" alt="يانعة" class="logo-image" width="70" height="70" style="display: block; margin: 0 auto;">
                        </td>
                    </tr>
                </table>

                <!-- Header Banner -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #006173; border-radius: 0;">
                    <tr>
                        <td style="padding: 15px;">
                            <h1 style="color: #8bc53f; text-align: center; margin: 0; font-weight: bold; font-size: 1.5rem;">
                                تأكيد استلام طلب التسجيل
                            </h1>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: white; margin-bottom: 30px;">
                    <tr>
                        <td class="main-content" style="padding: 30px;">
                            <p style="color: #FF0000; font-weight: bold; font-size: 1.2rem; line-height: 1.7; margin: 20px 0; text-align: center;">
                                مرحباً ${props.name}،
                            </p>
                            <p style="color: #000000; font-size: 1.1rem; line-height: 1.8; text-align: center; margin: 20px 0;">
                                نود إعلامك بأن طلب التسجيل الخاص بك قد تم استلامه بنجاح، وهو قيد المراجعة حاليًا من قِبل المسؤول.
                            </p>
                            <p style="color: #000000; font-size: 1.1rem; line-height: 1.8; text-align: center; margin: 20px 0;">
                                ستصلك رسالة تأكيد بمجرد مراجعة وتفعيل حسابك.
                            </p>
                            <p style="color: #000000; font-size: 1.1rem; line-height: 1.8; text-align: center; margin: 20px 0;">
                                نشكرك على اهتمامك وانضمامك إلينا.
                            </p>
                            <p style="color: #8bc53f; font-size: 1.1rem; font-weight: bold; text-align: center; margin: 30px 0 10px 0;">
                                مع أطيب التحيات،
                            </p>
                            <p style="color: #8bc53f; font-size: 1.1rem; font-weight: bold; text-align: center; margin: 0;">
                                موقع يانعة
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Footer Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 0;">
                            <img src="https://images.yaneah.com/Footer.jpg" alt="Footer" width="100%" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
</body>
</html>`;

export const userUpdateTemplate = (props: {
  name: string;
  status: string;
}) => `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @font-face {
            font-family: 'PingARLT';
            src: url('https://fonts.gstatic.com/s/pingarlt/v1/3q8b2f4a5c9d7e6f0c8b2f4a5c9d7e6f.woff2') format('woff2');
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
                width: 50px !important;
                height: 50px !important;
            }
            .content-padding {
                padding: 1rem !important;
            }
            .main-content {
                padding: 1rem !important;
            }
        }
    </style>
</head>
<body style="font-family: 'PingARLT', Verdana, sans-serif; margin: 0; padding: 0; background-color: white;">
<div class="outer-container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="inner-table">
        <tr>
            <td align="center" class="content-padding">
                <!-- Logo Header -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding-bottom: 50px;">
                            <img src="https://admin.qyam.org/images/pngLogo.png" alt="يانعة" class="logo-image" width="70" height="70" style="display: block; margin: 0 auto;">
                        </td>
                    </tr>
                </table>

                <!-- Header Banner -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #006173; border-radius: 0;">
                    <tr>
                        <td style="padding: 15px;">
                            <h1 style="color: #8bc53f; text-align: center; margin: 0; font-weight: bold; font-size: 1.5rem;">
                                ${props.status === "accepted" ? "تم تفعيل حسابك بنجاح" : "تحديث حالة المستخدم"}
                            </h1>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: white; margin-bottom: 30px;">
                    <tr>
                        <td class="main-content" style="padding: 30px;">
                            ${
                              props.status === "accepted"
                                ? `
                                <p style="color: #000000; font-weight: bold; font-size: 1.13rem; line-height: 1.7; margin: 0; text-align: center;">
                                    مرحباً <span style="color: #FF0000;">${props.name}</span>،
                                </p>
                                <p style="color: #000001; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 16px 0;">
                                    يسعدنا إعلامك بأنه قد تم قبول طلبك وتفعيل حسابك بنجاح.
                                </p>
                                <p style="color: #000101; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 24px 0;">
                                    يمكنك الآن تسجيل الدخول والبدء في استخدام حسابك عبر الرابط التالي: 
                                    <a href="https://qyam.org/login" style="color: #006173; font-weight: bold; text-decoration: none;">رابط تسجيل الدخول</a>.
                                </p>
                                <p style="color: #000000; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 10px 0;">
                                    نرحب بانضمامك ونتمنى لك تجربة مميزة معنا.
                                </p>
                                <p style="color: #000000; font-size: 1.13rem; font-weight: bold; text-align: center; margin: 20px 0 0 0;">
                                    مع أطيب التحيات،
                                </p>
                                <p style="color: #000000; font-size: 1.13rem; font-weight: bold; text-align: center; margin: 20px 0 0 0;">
                                    موقع يانعة
                                </p>
                                `
                                : `
                                <p style="color: #000000; font-weight: bold; font-size: 1.13rem; line-height: 1.7; margin: 0; text-align: center;">
                                    مرحباً <span style="color: #FF0000;">${props.name}</span>،
                                </p>
                                <p style="color: #000001; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 16px 0;">
                                    لقد تم تحديث حالة طلبك إلى: ${props.status}
                                </p>
                                ${
                                  props.status === "denied"
                                    ? `<p style="color: #000101; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 24px 0;">نأسف، تم رفض طلبك.</p>`
                                    : props.status === "pending"
                                    ? `<p style="color: #000101; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 24px 0;">حالة طلبك قيد المراجعة.</p>`
                                    : props.status === "rejected"
                                    ? `<p style="color: #000101; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 24px 0;">تم رفض طلبك.</p>`
                                    : props.status === "idle"
                                    ? `<p style="color: #000101; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 24px 0;">حالة طلبك غير نشطة.</p>`
                                    : ""
                                }
                                `
                            }
                        </td>
                    </tr>
                </table>

                <!-- Footer Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 0;">
                            <img src="https://images.yaneah.com/Footer.jpg" alt="Footer" width="100%" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
</body>
</html>`;

export const accountDeactivationTemplate = (props: {
  username: string;
  contactUrl?: string;
}) => `<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @font-face {
            font-family: 'PingARLT';
            src: url('https://fonts.gstatic.com/s/pingarlt/v1/3q8b2f4a5c9d7e6f0c8b2f4a5c9d7e6f.woff2') format('woff2');
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
                width: 50px !important;
                height: 50px !important;
            }
            .content-padding {
                padding: 1rem !important;
            }
            .main-content {
                padding: 1rem !important;
            }
        }
    </style>
</head>
<body style="font-family: 'PingARLT', Verdana, sans-serif; margin: 0; padding: 0; background-color: white;">
<div class="outer-container" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="inner-table">
        <tr>
            <td align="center" class="content-padding">
                <!-- Logo Header -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding-bottom: 50px;">
                            <img src="https://admin.qyam.org/images/pngLogo.png" alt="يانعة" class="logo-image" width="70" height="70" style="display: block; margin: 0 auto;">
                        </td>
                    </tr>
                </table>

                <!-- Header Banner -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #006173; border-radius: 0;">
                    <tr>
                        <td style="padding: 15px;">
                            <h1 style="color: #8bc53f; text-align: center; margin: 0; font-weight: bold; font-size: 1.5rem;">
                                إلغاء تفعيل الحساب
                            </h1>
                        </td>
                    </tr>
                </table>

                <!-- Subtitle -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="padding: 15px;">
                            <div style="color: #0d3151; text-align: center; font-weight: bold; font-size: 1.5rem; margin: 0;">
                                تم إلغاء تفعيل حسابك
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Main Content Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: white; margin-bottom: 30px;">
                    <tr>
                        <td class="main-content" style="padding: 30px;">
                            <p style="color: #000000; font-weight: bold; font-size: 1.13rem; line-height: 1.7; margin: 0; text-align: center;">
                                مرحباً <span style="color: #FF0000;">${
                                  props.username
                                }</span>،
                            </p>

                            <p style="color: #000001; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 16px 0;">
                                نود إبلاغك بأنه تم إلغاء تفعيل حسابك في الوقت الحالي.
                            </p>

                            <p style="color: #000101; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 24px 0;">
                                إذا كنت تعتقد أن هذا حدث عن طريق الخطأ، يرجى التواصل معنا عبر 
                                <a href="${
                                  props.contactUrl || "/contact"
                                }" style="color: #FF0000; font-weight: bold; font-size: 1.13rem; text-decoration: none;">
                                    روابط أو وسيلة الموقع
                                </a>.
                            </p>

                            <p style="color: #000000; font-size: 1.13rem; line-height: 1.8; text-align: center; margin: 10px 0;">
                                شكرًا لتفهمك وتعاونك.
                            </p>

                            <p style="color: #000000; font-size: 1.13rem; font-weight: bold; text-align: center; margin: 20px 0 0 0;">
                                مع أطيب التحيات.
                            </p>

                            <p style="color: #000000; font-size: 1.13rem; font-weight: bold; text-align: center; margin: 20px 0 0 0;">
                                موقع يانعة
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Footer Section -->
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                    <tr>
                        <td style="text-align: center; padding: 0;">
                            <img src="https://images.yaneah.com/Footer.jpg" alt="Footer" width="100%" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>
</body>
</html>`;
