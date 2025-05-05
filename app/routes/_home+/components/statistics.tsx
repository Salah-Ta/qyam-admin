import { useLoaderData } from "@remix-run/react";
import TitleBlock from "~/components/ui/title-block";
import ColoredDrop from "~/assets/images/coloreddrop.png";


const Statistics = () => {
  const { stats } = useLoaderData<{ stats: { registeredUsers: number; curriculums: number; trainingHours: number } }>();

  return (
    <section id="statistics" className="   min-h-[40vh]">

      <TitleBlock className="md:m-24 m-6" text="إحصائيات" />
      <div className="flex gap-36 w-full h-full md:m-10 mt-24 justify-center flex-wrap">
        <div className="bg-secondary py-10  min-w-44 rounded-3xl h-[30vh] max-h-full min-h-56 w-1/6">
          <div className="relative">
            <img
              src={ColoredDrop}
              className="absolute inset-0 -top-20 mx-auto"
              alt=""
            />
          </div>

          <div className=" h-full w-full flex flex-col  items-center justify-between">
            <h1 className="text-primary">{stats?.registeredUsers}</h1>
            <h4 className="text-primary">المسجلين</h4>
            <svg
              width="69"
              height="51"
              viewBox="0 0 69 51"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M60.4979 43.4167C62.7146 43.4167 64.4778 42.0219 66.0608 40.0712C69.3016 36.0783 63.9808 32.8874 61.9513 31.3249C59.8885 29.7362 57.5851 28.8363 55.2498 28.6251M52.2915 22.7084C56.3761 22.7084 59.6873 19.3972 59.6873 15.3126C59.6873 11.228 56.3761 7.91675 52.2915 7.91675"
                stroke="#141B34"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M8.58514 43.4167C6.36843 43.4167 4.60532 42.0219 3.02223 40.0712C-0.218481 36.0783 5.10232 32.8874 7.13165 31.3249C9.19459 29.7362 11.498 28.8363 13.8333 28.6251M15.3125 22.7084C11.2279 22.7084 7.91667 19.3972 7.91667 15.3126C7.91667 11.228 11.2279 7.91675 15.3125 7.91675"
                stroke="#141B34"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M22.956 34.8706C19.9332 36.7396 12.0077 40.5562 16.8349 45.3318C19.1929 47.6647 21.8192 49.3333 25.121 49.3333H43.962C47.2638 49.3333 49.8899 47.6647 52.248 45.3318C57.0751 40.5562 49.1497 36.7396 46.1269 34.8706C39.0385 30.4875 30.0442 30.4875 22.956 34.8706Z"
                stroke="#141B34"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M44.8956 12.3542C44.8956 18.0726 40.2599 22.7083 34.5415 22.7083C28.823 22.7083 24.1873 18.0726 24.1873 12.3542C24.1873 6.63571 28.823 2 34.5415 2C40.2599 2 44.8956 6.63571 44.8956 12.3542Z"
                stroke="#141B34"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>
        <div className="bg-primary  rounded-3xl min-w-44  py-10  w-1/6 h-[30vh] max-h-full min-h-56">
          <div className="relative">
            <img
              src={ColoredDrop}
              className="absolute inset-0 -top-20 mx-auto"
              alt=""
            />
          </div>
          <div className=" h-full w-full flex flex-col items-center justify-between">
            <h1 className="text-white">{stats?.curriculums}</h1>
            <h4 className="text-white">المناهج</h4>
            <svg
              width="36.75"
              height="35"
              viewBox="0 0 62 59"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M44.6202 40.9431C36.9403 45.3306 32.5586 54.4222 31.1665 56.9637V17.0262C32.3755 14.8192 35.839 8.49571 41.759 4.19791C44.253 2.38738 45.4999 1.4821 47.0833 2.30753C48.6665 3.133 48.6665 4.95509 48.6665 8.59926V34.7507C48.6665 36.7192 48.6665 37.7035 48.2681 38.3951C47.8694 39.0868 46.7864 39.7057 44.6202 40.9431Z"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M31.1667 16.4511C29.1632 14.3165 23.3551 9.24705 13.61 7.46963C8.67304 6.56917 6.20458 6.11894 4.10227 7.8446C2 9.57025 2 12.3725 2 17.9769V38.1183C2 43.2427 2 45.805 3.34925 47.4045C4.6985 49.0044 7.66898 49.5461 13.61 50.6297C18.906 51.5956 23.0392 53.1348 26.031 54.6814C28.9745 56.2029 30.4462 56.9638 31.1667 56.9638C31.8871 56.9638 33.3588 56.2029 36.3023 54.6814C39.2942 53.1348 43.4275 51.5956 48.7232 50.6297C54.6645 49.5461 57.6348 49.0044 58.9841 47.4045C60.3333 45.805 60.3333 43.2427 60.3333 38.1183V17.9769C60.3333 12.3725 60.3333 9.57025 58.231 7.8446C56.1287 6.11894 51.5833 7.46963 48.6667 9.63045"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div className="bg-[#D0D5DD]   rounded-3xl min-w-44 py-10  h-[30vh] max-h-full min-h-56 w-1/6">
          <div className="relative">
            <img
              src={ColoredDrop}
              className="absolute inset-0 -top-20 mx-auto"
              alt=""
            />
          </div>
          <div className=" h-full w-full flex flex-col items-center justify-between">
            <h1 className="text-black">{stats?.trainingHours}</h1>
            <h4 className="text-black">ساعة تدريبية</h4>
            <svg width="63" height="63" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M31.5833 61.1667C47.9218 61.1667 61.1667 47.9218 61.1667 31.5833C61.1667 15.2449 47.9218 2 31.5833 2C15.2449 2 2 15.2449 2 31.5833C2 47.9218 15.2449 61.1667 31.5833 61.1667Z" stroke="black" strokeWidth="2.5"/>
<path d="M31.5834 19.75V31.5833L37.5 37.5" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
