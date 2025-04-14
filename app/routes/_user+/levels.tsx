import glossary from "../../lib/glossary";
import TitleBlock from "~/components/ui/title-block";
import QyamSign from "~/assets/images/qyam-sign.png";
import { Link } from "@remix-run/react";


const Levels = () => {

  const levels = [
    {
      title: "المستوى الأول : شهادة مهندس القيم الممارس",
      img: null,
      method: [
        "مقدمة تأصيلية في القيم",
        "استراتيجيات بناء القيم",
        "تصميم المبادرات والبرامج القيمية",
        "مشروع المستوى الأول",
      ],
    },
    {
      title: "المستوى الثاني : شهادة أخصائي القيم",
      img: null,
      method: [
        "تصميم الأنشطة القيمية",
        "التسويق القيمي",
        "مشروع المستوى الثاني",
      ],
    },
    {
      title: "المستوى الثالث : شهادة خبير القيم",
      img: QyamSign,
      method: [
        "المدرب المعتمد في التدريب على القيم",
        "الكوتشينج في القيم",
        "بناء المؤشرات وأدوات القياس ",
        "مشروع المستوى الثالث",
      ],
    },
  ];
  return (
    <section id="levels" className="bg-section md:pt-48 pt-24 ">
      <div className="w-4/5  mx-auto">
        <div className="flex justify-between">
          <TitleBlock text={glossary.levels.title} />

          <Link to={"/join"} className="text-lg text-white font-bold bg-primary rounded-lg p-3 hover:opacity-95 transition-all">
            {glossary.levels.button_user.idle}
          </Link>
   
        </div>

        <p className="mt-12 w-11/12 mx-auto">{glossary.levels.description}</p>
        <div className="mt-12 ">
          {levels.map((level: any, ind: number) => (
            <div key={ind} className="flex flex-col gap-y-4">
              <h6 className="bg-primary p-4 rounded-lg text-white">
                {level.title}
              </h6>
              <div className="rounded-2xl bg-white mb-12 p-5 flex  justify-between ">
                <div>
                  <h6 className="font-bold leading-loose">المنهاج :</h6>

                  <ul className="list-disc pr-4">
                    {level.method.map((item: any, i: number) => (
                      <li key={i} className="md:text-lg text-sm font-medium">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {level.img && (
                  <img
                    className="md:h-auto md:w-auto h-24 w-24"
                    src={level.img}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Levels;
