import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import Map from "@/components/Map";

const ContactPage = () => {
  return (
    <div className="w-full bg-[#f6f7fb] py-20 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#1f3c88] mb-6">
            TRUNG TÂM <br /> GIA SƯ ÔNG MẶT TRỜI
          </h1>

          <div className="space-y-4 text-gray-700 text-lg ">
            <div className="flex items-start gap-3">
              <MapPin className="text-red-500 mt-1" size={20} />
              <p>
                <b>TP.HCM:</b> 45 đường số 20, phường 11, quận 6, TP.HCM.
                <br />
                {/* <b>Hà Nội:</b> 238/1 Hoàng Quốc Việt, Cầu Giấy, Hà Nội. */}
              </p>
            </div>

            <div className=" relative flex flex-col gap-3 ">
              <div className="flex items-center gap-3 ">
                <Phone className="text-red-500" size={20} />
                <a href="tel:0326022511" className="relative group">
                  032 602 2511
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-red-400 scale-x-0 origin-center transition-transform duration-300 group-hover:scale-100 " />
                </a>
                {" - "}
                <a href="tel:0813454248" className="relative group">
                  081 345 4248
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-red-400 scale-x-0 origin-center transition-transform duration-300 group-hover:scale-100 " />
                </a>
              </div>

              <div className="flex items-center gap-3 ">
                <Mail className="text-red-500" size={20} />
                <a
                  href="mailTo:thanhthuyy1010@gmail.com"
                  className="relative group"
                >
                  thanhthuyy1010@gmail.com
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-red-400 scale-x-0 origin-center transition-transform duration-300 group-hover:scale-100 " />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="font-bold text-xl mb-4">THEO DÕI CHÚNG TÔI</h3>

            <div className="flex gap-5 text-gray-600">
              <Facebook className="cursor-pointer hover:text-blue-600" />
              <Instagram className="cursor-pointer hover:text-pink-600" />
              <Youtube className="cursor-pointer hover:text-red-600" />
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="bg-white shadow-xl overflow-hidden">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
