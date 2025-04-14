import OutroImg from "~/assets/images/outro.png";
const Outro = () => {
  return (
    <section
      id="outro"
      className="md:min-h-[80vh] mb-48 flex justify-normal items-center relative"
    >
      <svg
        className="absolute md:block hidden left-1/2"
        xmlns="http://www.w3.org/2000/svg"
        width="349"
        height="428"
        viewBox="0 0 349 428"
        fill="none"
      >
        <path
          d="M4.01179 397.092C10.7894 402.303 17.3863 406.701 23.8326 410.316C46.6356 423.178 67.571 426.522 88.2353 422.606C123.208 416.009 159.837 389.17 204.028 352.239L279.244 289.433C342.834 236.326 355.365 172.014 338.647 117.943C330.815 92.5497 316.597 69.325 298.252 50.4681C279.937 31.6715 257.586 17.2727 233.397 9.44078C185.261 -6.07249 129.293 4.83199 83.1144 59.8062L18.0792 136.86L2.65625 155.145"
          stroke="#0D3151"
          className={"animated-path"}
          strokeWidth="6"
          strokeMiterlimit="10"
        />
      </svg>

      <svg
        className="absolute  md:block hidden right-1/2"
        xmlns="http://www.w3.org/2000/svg"
        width="462"
        height="428"
        viewBox="0 0 462 428"
        fill="none"
      >
        <path
          d="M69.1525 289.698C5.56311 236.591 -6.99811 172.279 9.72008 118.208C17.552 92.8146 31.8001 69.5898 50.1449 50.7329C68.4596 31.9061 90.8108 17.5074 114.999 9.70558C163.106 -5.80769 219.074 5.09679 265.252 60.071L330.288 137.095L349.235 159.537L457.798 288.131L368.724 375.909C362.037 382.506 355.561 388.35 349.235 393.471C340.74 400.429 332.517 406.092 324.534 410.581C301.731 423.413 280.826 426.787 260.131 422.871C225.189 416.274 188.559 389.404 144.339 352.504"
          stroke="#8BC53F"
          strokeWidth="6"
          className={"animated-path"}

          strokeMiterlimit="10"
        />
      </svg>
      <img className="mx-auto" src={OutroImg} />
    </section>
  );
};

export default Outro;
