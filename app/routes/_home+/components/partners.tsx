import  { useEffect } from "react";
import TitleBlock from "~/components/ui/title-block";
import glossary from "../../../lib/glossary";
import GradientEllipse from "~/components/ui/gradient-ellipse";
import AllPartners from "~/assets/images/logos.webp";

import { infiniteScroller } from "~/lib/animation";

const Partners = () => {
  useEffect(() => {
    infiniteScroller();
  });
  return (
    <section id="parterns" className="relative md:mt-52 lg:mt-0 min-h-[40vh]">
      <div className=" blur-[180px] inset-0 absolute">
        <GradientEllipse
          bgColor={"bg-[#B8ECFF]/70"}
          className={" top-1/4 -right-96"}
        />
      </div>

      <TitleBlock className="md:m-24 m-6" text={glossary.partners.title} />

      <div className="flex flex-wrap gap-16 w-full justify-center sm:gap-4">
  
        <img className="lg:w-4/5" src={AllPartners} alt="logos"/>

        </div>

      {/* <div className="scroller">
        <div className="scroller__inner">

              <img src={Partner1} alt="" />
              <img src={Partner2} alt="" />
              <img src={Partner3} alt="" />
              <img src={Partner4} alt="" />
              <img src={Partner5} alt="" />
              <img src={Partner6} alt="" />

              

        </div>
      </div> */}
      {/* <img src={AllPartners} alt="" /> */}
    </section>
  );
};

export default Partners;
