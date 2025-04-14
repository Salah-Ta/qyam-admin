import { NavLink, Outlet } from "@remix-run/react";


const Center = () => {

  const categories = [
    { id: "courses", label: "المناهج" },
    { id: "programs", label: "البرامج" },
    { id: "articles", label: "المقالات" },
  ];

  return (
    <section className="pt-24 px-6 lg:px-48 flex flex-col lg:flex-row lg:justify-between lg:gap-x-12 bg-section min-h-screen ">
      <div>
        <div className="flex flex-row lg:flex-col gap-2">
          {categories.map((category) => (
            <NavLink
              className={
                "hover:bg-primary/10 w-max lg:w-52 my-4 transition-all font-bold rounded-lg  text-center border border-[#3479B7] aria-[current=page]:bg-primary aria-[current=page]:text-white p-4"
              }
              prefetch="viewport"
              to={category.id}
            >
              <span className={"h-full w-full"}>
                {category.label}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className="bg-white w-full border border-gray-100 rounded-lg  lg:m-5 p-5">
      <Outlet/>
      </div>

     
    </section>
  );
};

export default Center;
