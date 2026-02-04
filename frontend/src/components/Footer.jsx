import {
  Facebook,
  Instagram,
  LocationEdit,
  Mail,
  PhoneCall,
  Youtube,
} from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <div>
      <div className="bg-black">
        <div className="grid grid-cols-1 lg:grid-cols-2 p-4 max-w-5xl mx-auto">
          <div className="text-white flex flex-col gap-3 px-7 p-2">
            {/* left footer */}
            <div className="flex gap-5">
              <div>
                <img
                  src="https://d1reana485161v.cloudfront.net/i/logo_findtutors_v3.svg"
                  alt="logo trung tam gia su"
                  className="h-15 w-auto hover:cursor-pointer"
                />
              </div>
              <div className="font-bold text-2xl">
                TRUNG TÂM
                <br />
                GIA SƯ ÔNG MẶT TRỜI
              </div>
            </div>
            {/* location */}
            <div className="flex">
              <div className="mt-1.5 mr-3">
                <LocationEdit size={20} />
              </div>
              <div className="flex flex-col text-[16px] lg:text[14px]">
                <p>
                  <strong>TP.HCM: </strong>
                  <a href="#">45 đường số 20, phường 11, quận 6, TPHCM</a>
                </p>
                <p>
                  <strong>Hà Nội </strong>
                  <a href="">238/1 Hoàng Quốc Việt, Cầu Giấy, Hà Nội </a>
                </p>
              </div>
            </div>
            {/* phone */}
            <div className="flex">
              <div className="mt-0.5 mr-3">
                <PhoneCall size={20} />
              </div>
              <div>
                <a href="tel:0326022511">032 602 2511</a>
                {" - "}
                <a href="tel:0813454248">081 345 4248</a>
              </div>
            </div>
            {/* email */}
            <div className="flex">
              <div className="mt-0.5 mr-3">
                <Mail size={20} />
              </div>
              <div>
                <a href="mailTo:thanhthuyy1010@gmail.com">
                  thanhthuyy1010@gmail.com
                </a>
              </div>
            </div>
            <hr className="hidden lg:block text-[#aaa] max-w-[460px]" />
            <div className="hidden lg:block">
              <p className="text-[16px] font-semibold">
                CÔNG TY TNHH TRUNG TÂM GIA SƯ ÔNG MẶT TRỜI
              </p>
              <p className="text-[14px]">
                Địa chỉ: 45 đường số 20, Phường 11, Quận 6, Thành phố Hồ Chí
                Minh, Việt Nam
              </p>
            </div>
          </div>
          {/* center footer */}
          <div className="px-7">
            <div className="text-white pb-2 text-[18px] font-semibold lg:pb-7">
              <ul>
                <li>Giới thiệu</li>
                <li>Học phí tham khảo</li>
                <li>Liên hệ</li>
              </ul>
            </div>
            <hr className=" text-[#aaa] max-w-[270px]" />
            <div className="flex flex-col gap-2 pt-2 lg:pt-7">
              <h2>Trung tâm gia sư Ông Mặt Trời</h2>
              <h4 className="text-white font-semibold">THEO DÕI CHÚNG TÔI</h4>
              <div className="flex gap-3 text-white">
                <a href="#">
                  <Facebook size={24} />
                </a>
                <a href="#">
                  <Instagram size={24} />
                </a>
                <a href="#">
                  <Youtube size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
