import React from "react";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import cardImg from "~/assets/images/new-design/image-1.png";
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

// Data for the paragraphs to enable mapping
const paragraphs = [
  "تعد القيم بمثابة الخريطة التي نسترشد بها في رحلة حياتنا، هي المبادئ والمعايير التي نؤمن بها ونحاول أن نعيش وفقها. إنها بوصلتنا التي تساعدنا في اتخاذ القرارات الصحيحة وتحديد مسارنا في الحياة. تتجاوز القيم كونها مجرد أفكار، بل هي القوة الدافعة التي تحرك سلوكنا وتشكل شخصيتنا وعلاقاتنا مع الآخرين.",
  "لماذا تعتبر القيم مهمة؟",
  "بناء شخصية قوية ومتوازنة: القيم هي اللبنة الأساسية التي تبنى عليها شخصيتنا. عندما نمتلك مجموعة قيم واضحة، نشعر بالاستقرار والاتزان النفسي. تساعدنا القيم على التعامل مع التحديات والصعاب التي تواجهنا في الحياة، وتمنحنا القوة والإرادة لمواجهتها",
  "تحديد الهوية: القيم تعكس هويتنا وطريقة تفكيرنا. إنها تميزنا عن الآخرين وتجعلنا أفرادا فريدين. عندما نعيش وفقا لقيمنا، نشعر بالانتماء إلى أنفسنا وإلى المجتمع الذي نعيش فيه.",
  "بناء علاقات قوية: القيم الجيدة تساعدنا على بناء علاقات قوية ومتينة مع الآخرين. عندما نتعامل مع الناس باحترام وتقدير، ونكون صادقين ومخلصين في علاقاتنا، نكسب ثقتهم واحترامهم.",
  "إيجاد السعادة والرضا: عندما نعيش حياة تتفق مع قيمنا، نشعر بالسعادة والرضا عن أنفسنا. نعرف أننا نسير في الطريق الصحيح وأننا نساهم في بناء عالم أفضل.",
  "التأثير الإيجابي في المجتمع: القيم الجيدة لا تقتصر فائدتها على الفرد فقط، بل تمتد لتشمل المجتمع ككل. عندما يعيش أفراد المجتمع وفقا لقيم مشتركة، يتحقق التعاون والتكاتف، وينعم المجتمع بالاستقرار والازدهار.",
];

export const Section2 = (): JSX.Element => {
  return (
    <Card className="flex flex-col w-full   items-end gap-[42px] p-4 rounded-3xl shadow-shadows-shadow-md mb-[505.5px] md:mt-[165.5px]">
      <img className="w-full h-auto object-cover" alt="Image" src={cardImg} />

      <CardContent className="flex flex-col items-end justify-center gap-6 w-full p-0">
        <h1 className="  font-bold text-[32px] leading-7 [direction:rtl] w-full text-[#1f2a37] tracking-[0] ">
          أهمية القيم في حياتنا: ركيزة أساسية للشخصية والمجتمع
        </h1>

        <div className="flex flex-col items-start gap-4 w-full">
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="[ text-right font-normal text-2xl  leading-[33.6px] w-full text-[#1f2a37] tracking-[0] [direction:rtl]"
            >
              {index >= paragraphs.length - 5 ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#1f2a37",
                      borderRadius: "50%",
                      marginLeft: "10px",
                      marginRight: "10px",
                    }}
                  />
                  {paragraph}
                </>
              ) : (
                paragraph
              )}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Section2;
