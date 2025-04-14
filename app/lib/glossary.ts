const about = {
  title: {
    part1: "عن",
    part2: "البرنامج",
  },
  description: `برنامج "هندسة القيم" خطوة رائدة في هذا الاتجاه، حيث يسعى إلى إعداد
      مختصين وخبراء يمتلكون خلفيات نظرية واسعة حول القيم ويجيدون تطبيقها
      بمنهجيات عملية فعالة تؤثر في البيئات الشبابية والتربوية. بالشراكة
      العلمية مع بيت الخبرة المعتمد لدى جامعة الملك عبد العزيز (قيم)، يقدم
      البرنامج نموذجًا متكاملاً يجمع بين الجوانب النظرية والتطبيقية
      والتقويمية في مجال غرس القيم وتعزيزها، مما يسهم في بناء مجتمعات راسخة
      تقوم على مبادئ أصيلة`,
  more: "المزيد",
  join: "الانضمام للبرنامج",
};

const hero = {
  title: "برنامج هندسة القيم",
  join: "انضم الآن",
  profile: "الملف التعريفي",
};

const partners = {
  title: "الشركاء",
};
const evaluation_methods = {
  title: "أساليب التقييم",
  description: "يتم تقويم أداء المتدربين و مستوى تحصيلهم وتقديمهم من خلال :",
  applied_projects: " المشاريع التطبيقية",
  performative_tasks: "المهام الأدائية",
  knowledge_tests: "الاختبارات المعرفــيـة",
  education_situation: "الحــالات الدراسية",
};

const teaching_methods = {
  title: "أساليب التعليم في البرامج",
  training_workshops: "الورش التدريبية",
  enrichment_readings: "القراءات الإثرائية",
  instructions_and_guidance: "الإرشاد والتوجيه",
  expert_intereviews: "لقاءات الخبراء",
  projects: "المشاريع",
  distance_learning: "التعلم عن بعد",
  self_education: "التعليم الذاتي",
};

const targeted_users = {
  title: "المستهدفون",
  parents: "الوالدان",
  youth_supervisors: "مشرفي البيئات الشبابية",
  programs_supervisors: "مشرفي الأنشطة والبرامج التربوية",
};

const levels = {
  title: "مستويات البرنامج",
  button_user:{
    pending:"تم ارسال طلب الانضمام",
    accepted:"تم الانضمام للبرنامج",
    rejected:"الانضمام للبرنامج",
    idle:"الانضمام للبرنامج",

  },

  description:
    'يقدم برنامج "هندسة القيم" من خلال ثلاثة مستويات متكاملة تهدف إلى تعزيز المهارات والمعرفة اللازمة لفهم وتطبيق القيم في البيئات الشبابية . البرنامج مصمم بأسلوب تدريجي حيث يرتقي المشاركون من مستوى الممارس إلى الأخصائي، وصولاً إلى درجة الخبير، لتحقيق كفاءة عالية في مجال القيم.',
};

const footer = {
  copyrights: "© جميع الحقوق محفوظة لجمعية أفاق الخفجي.",
  description:
    "منصة تدعو إلى مبادرة شاملة لإعداد الخبراء والمختصين لتقديم محتوى تربوي بمنهجيات عملية فعالة تؤثر في البيئات الشبابية والتربوية",
};

const status_response = {
  success: {
    material_added: "تمت إضافة المقرر بنجاح",
    material_updated: "تم  تحديث المقرر بنجاح",
    material_deleted: "تم حذف المقرر بنجاح",
    user_accepted: "تم قبول المستخدم بنجاح",
    user_denied: "تم استبعاد المستخدم بنجاح",
    article_added:"تمت اضافة المقال",
    article_updated:"تم تعديل المقال",
    article_deleted:"تم حذف المقال"
  },
  error: {
    general:"حدث خطأ ما",
    material_added: "حدث خطأ أثناء إضافة المقرر",
    material_updated: "حدث خطأ أثناء تحديث المقرر",
    material_deleted: "حدث خطأ أثناء حذف المقرر",
    user_accepted: "حدث خطأ أثناء قبول المستخدم",
    user_denied: "حدث خطأ أثناء استبعاد المستخدم",
    article_added:"حدث خطأ أثناء اضافة المقال",
    article_updated:"حدث خطأ أثناء تعديل المقال",
    article_deleted:"حدث خطأ أثناء حذف المقال"
  },
};


const cp = {
  control_panel:"لوحة النظام",
  registered:"المسجلين",
  accepted:"المقبولين",
  rejected:" الغير مقبولين",
  material:"المناهج",
  messages:"الرسائل",
  articles:"المقالات",
  programs:"البرامج",
  admin:"مدير النظام",


  user:{
    pending:"قيد التنفيذ",
    denied:"مرفوض",
    accepted:"مقبول",
    idle:"غير نشط",
    edit_status_success:"تم تحديث حالة انضمام المستخدم",
    edit_status_failure:"فشلت عملية تحديث حالة انضمام المستخدم",
        bulk_edit_status_success:"تم تحديث حالة انضمام المستخدمين",
   bulk_edit_status_failure:"فشلت عملية تحديث حالة انضمام المستخدمين",
    delete_success: "تم حذف المستخدم بنجاح",
    delete_failure: "فشلت عملية حذف المستخدم"

  }


}



const email = {
  program_status_subject:"حالة طلب الانضمام",
  acceptence_message : "تم قبولك في برنامج قيم٬ يمكنك الاطلاع على مختلف البرامج عبر المنصة",
  rejection_message: "تم رفض طلبك للانضمام إلى برنامج قيم٫ نتمنى لك حظًا موفقًا"
}

const contact = {
  title: "تواصل معنا",
  description: "يمكنك التواصل معنا عبر تعبئة النموذج التالي",
  form: {
    name: "الاسم",
    email: "البريد الإلكتروني",
    message: "الرسالة",
    submit: "إرسال",
    placeholders: {
      name: "الاسم الكامل",
      email: "example@domain.com",
      message: "اكتب رسالتك هنا"
    }
  },
  validation: {
    name: {
      required: "الرجاء إدخال الاسم"
    },
    email: {
      required: "الرجاء إدخال البريد الإلكتروني",
      invalid: "الرجاء إدخال بريد إلكتروني صحيح"
    },
    message: {
      required: "الرجاء إدخال الرسالة",
      minLength: "الرسالة يجب أن تكون على الأقل ١٠ أحرف"
    }
  },
  toasts: {
    success: "تم إرسال رسالتك بنجاح",
    error: "حدث خطأ في إرسال الرسالة. الرجاء المحاولة مرة أخرى"
  }
};
export default {
  about,
  hero,
  email,
  partners,
  teaching_methods,
  evaluation_methods,
  targeted_users,
  levels,
  footer,
  status_response,
  cp,
  contact
};
