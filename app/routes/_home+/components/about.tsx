import ColoredDrop from "~/components/ui/colored-drop";
import CurvedTriangle from "~/components/ui/curved-triangle";
import glossary from "~/lib/glossary";
import { Icon } from "~/components/icon";
import { useNavigate } from "@remix-run/react";

const About = () => {
  const navigate = useNavigate()
  return (
    <section id="about" className="relative h-[60vh] px-12 my-20 bg-[#F0F4F8] flex justify-center items-center">
      <div className="absolute -bottom-[60px] left-48 ">
        <CurvedTriangle color="#F0F4F8">
          <Icon size="sm" name="below-arrow" className="absolute top-10 left-[45%]" />
          <Icon size="sm"  name="below-arrow" className="absolute top-12 left-[45%]" />
        </CurvedTriangle>
      </div>
      <div className="w-2/5  md:flex  hidden justify-center items-center h-full">
        <div className="relative  w-1/2 h-1/2">
          <ColoredDrop
            size="mx"
            className={"absolute left-32   z-10"}
            color={"#0D3151"}
          />
          <ColoredDrop
            size="mx"
            className={"absolute z-20"}
            color={"#8BC53F"}
          />
        </div>
      </div>

      <div className="text-right md:w-3/5 w-full md:px-12">
        <h3 className="font-bold mb-5">
          <span className="text-secondary">{glossary.about.title.part1} </span>
          <span className="text-primary">{glossary.about.title.part2}</span>
        </h3>

        <p className="text-[#344054] l ">
        {glossary.about.description}
        </p>

        <div className="flex justify-end mt-12 gap-x-4">
          {/* <button onClick={()=>navigate("/levels")} className="text-center text-xs md:text-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05) bg-white  text-primary border border-[#D0D5DD] px-5 py-2 rounded-lg hover:opacity-60 transition-opacity">
          {glossary.about.more}
          </button> */}
          <button onClick={()=>navigate("/join")} className="text-center text-xs md:text-lg  bg-primary text-white border border-tertiary px-5 py-2  rounded-lg  hover:opacity-80 transition-opacity">
          {glossary.about.join} {" "}
          </button>
        </div>
      </div>

     
    </section>
  );
};

export default About;
