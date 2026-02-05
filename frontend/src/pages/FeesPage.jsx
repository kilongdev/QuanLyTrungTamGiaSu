import {
  dataCap1,
  dataCap2,
  dataDaiHoc,
  headers,
} from "@/components/FeesTable/feesdata";
import FeesTable from "@/components/FeesTable/FeesTable";
import React from "react";

const dataHeaderTable = [
  "Sinh viên giỏi",
  "Giáo viên tự do (đã tốt nghiệp)",
  "Giáo viên đứng lớp/ Thạc sĩ",
];

const FeesPage = () => {
  return (
    <>
      <div
        className="w-full h-164 bg-no-repeat bg-cover bg-center relative "
        style={{
          backgroundImage:
            "url(https://giasuttv.net/wp-content/uploads/2021/06/187146168_533083834731948_1070615797217668237_n.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 h-full flex flex-col justify-center px-10 text-white">
          <h1 className="text-3xl font-semibold mb-7">
            Tìm gia sư dạy kèm tại nhà chất lượng.
          </h1>

          <div className="flex gap-4">
            <button className="bg-red-500 px-6 py-3 rounded-[50px]">
              Gửi yêu cầu gọi lại tư vấn
            </button>
            <button className="bg-white text-red-500 px-6 py-3 rounded-[50px]">
              Xem học phí
            </button>
          </div>
        </div>
        <div className="relative z-10">
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3 md:translate-y-1/2 bg-blue-100 w-[90%] max-w-4xl rounded-2xl shadow-xl p-10 z-20 ">
            <h2 className="text-4xl font-semibold text-center">
              Bảng giá gia sư dạy kèm tại nhà
            </h2>
            <p className="text-center text-red-600 text-2xl">
              (Học phí mới nhất)
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center max-w-7xl p-5 my-25 mx-auto border-l border-r border-[#ccc] border-dashed">
        <div className=" text-2xl font-semibold text-blue-700">
          <h3>Dưới đây là bảng giá gia sư dạy kèm tại nhà tham khảo:</h3>
        </div>
        <div className="pt-4">
          <div className="border border-red-500 p-4">
            <p>
              <span className="text-red-800">
                {"( "}
                <span>Kí hiệu: </span>
                {"2b/tuần"}
              </span>
              {" = học 2 buổi 1 tuần; "}

              <span className="text-red-800">{"3b/tuần"}</span>
              {" = học 3 buổi 1 tuần"}
              <span>{")"}</span>
              <br />
              <span>
                – Mỗi buổi học
                <span className="text-red-600"> 1 giờ 30 phút đến 2 giờ </span>
                (nếu học thời gian nhiều hơn, học phí chênh lệch một ít sẽ được
                nhân viên trung tâm báo cụ thể khi trao đổi với phụ huynh/học
                viên).
              </span>
              <br />
              <span>
                – Học phí tính theo
                <span className="text-red-600"> 1 tháng </span>
                (quý Phụ huynh/Học viên gửi học phí trực tiếp cho Thầy Cô gia sư
                vào cuối mỗi tháng dạy. Ngoài học phí cuối mỗi tháng như đã ghi
                bên dưới, quý Phụ huynh/Học viên{" "}
                <span>
                  <strong>
                    không phải trả thêm bất kì chi phí tài liệu hoặc phí tìm gia
                    sư nào!).
                  </strong>
                </span>
              </span>
              <br />
              <span>
                – Học phí này có thể tăng giảm tùy theo{" "}
                <span>
                  <strong>yêu cầu đặc biệt</strong>
                </span>
                của phụ huynh/học viên,{" "}
                <span>
                  <strong>số lượng học viên, số buổi học</strong>
                </span>
                (mời quý Phụ huynh/Học viên liên hệ để được tư vấn Miễn Phí).
              </span>
            </p>
          </div>
        </div>
        <div className="w-full lg:max-w-5xl">
          <FeesTable
            title="Bảng giá gia sư dạy kèm"
            subtitle="cấp 1 (lớp 1, 2, 3, 4, 5)"
            headers={headers}
            data={dataCap1}
          />

          <FeesTable
            title="Bảng giá gia sư dạy kèm"
            subtitle="Cấp 2 (lớp 6, 7, 8, 9)"
            headers={headers}
            data={dataCap2}
          />

          <FeesTable
            title="Bảng giá gia sư dạy kèm"
            subtitle="cấp 3 (lớp 10, 11, 12, luyện thi đại học)"
            headers={headers}
            data={dataDaiHoc}
          />
        </div>

        <div className="w-full mt-10">
          <h2 className="text-2xl text-center text-blue-700 font-semibold">
            Bài viết liên quan
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 mt-3 gap-4">
          <div className="flex flex-col gap-2 items-center">
            <img
              src="https://giasuongmattroi.com/wp-content/uploads/2023/03/thong-tin-ve-trung-tam-gia-su.jpg"
              alt="Thông tin về bảng giá Gia Sư Ông Mặt Trời"
              width={500}
            />
            <p>Thông tin về bảng giá Gia Sư Ông Mặt Trời </p>
            <p>(Nguồn: VnExpress)</p>
          </div>
          <div className=" text-justify">
            <div>
              <h3 className="font-bold text-red-600 text-[18px]">
                1. Nhu cầu gia sư dạy kèm tại nhà và những lợi ích của việc thuê
                gia sư
              </h3>
              <p>
                <span className="font-semibold text-red-500">Tìm gia sư </span>
                dạy kèm tại nhà đã và đang trở thành một dịch vụ mà các bậc phụ
                huynh quan tâm khi có con đến tuổi đi học. Do công việc bận rộn,
                nhiều bậc phụ huynh rất khó có thể sắp xếp thời gian dạy thêm
                hoặc bên cạnh con trong những giờ tự học ở nhà. Ngoài ra, việc
                dạy kèm cho con ở các cấp càng cao thì càng đòi hỏi thêm nhiều
                kiến thức và kĩ năng, nhưng không phải ai cũng có thời gian để
                học hỏi. Chính vì những nhu cầu cấp trên mà dịch vụ gia sư dạy
                kèm tại nhà được nhiều phụ huynh lựa chọn và sử dụng. Nhìn
                chung, khi thuê trung tâm gia sư, phụ huynh sẽ nhìn thấy những
                ưu điểm sau:
              </p>
              <h3 className="font-bold text-red-600">
                1.1. Tiết kiệm thời gian
              </h3>
              <p>
                Việc đến tận nhà học viên để giảng dạy sẽ có{" "}
                <span className="font-semibold text-red-500">
                  bảng giá gia sư
                </span>{" "}
                cao hơn nhưng lại giúp cho học viên không cần phải gấp rút đến
                các trung tâm, lớp học thêm sau những giờ học, giờ làm việc mệt
                mỏi, đặc biệt với các địa điểm ở xa. nhất.
              </p>
              <p>
                {" "}
                Vì thế mà học viên có thể tiết kiệm được nhiều thời gian, công
                sức cho việc di chuyển để có thể dành nhiều thời gian và sức lực
                để việc học đạt hiệu quả cao
              </p>
            </div>
          </div>

          <div className="text-justify">
            <h3 className="font-bold text-red-600">
              1.2. Học viên được kèm cặp tận tình nhất
            </h3>
            <p>
              So với sỉ số 10 – 50 học viên trong một lớp học thêm hay ở các
              trung tâm, việc 1 kèm 1 hay dạy 1 nhóm nhỏ sẽ giúp học viên có cơ
              hội được gia sư hướng dẫn tận tình kỹ lưỡng nhất.
            </p>
            <p>
              Không còn tình trạng chờ đợi rất nhiều thắc mắc được giải quyết,
              học viên có thể tự do trao đổi với{" "}
              <span className="font-semibold text-red-500">
                trung tâm gia sư uy tín
              </span>{" "}
              và mọi thắc mắc sẽ được giải quyết kịp thời và nhanh chóng nhất.
            </p>
            <h3 className="font-bold text-red-600">
              1.3. Phương pháp học tập tối ưu
            </h3>
            <p>
              Năng lực học tập cũng như phương pháp học tập của mỗi người là
              khác nhau, đây là vấn đề mà các lớp học thêm cũng như trung tâm
              với số lượng học sinh đông khó với cùng một phương pháp dạy học
              chung cho tất cả học viên khó có thể giải quyết được.
            </p>
            <p>
              {" "}
              Ngược lại,{" "}
              <span className="font-semibold text-red-500">
                gia sư giỏi
              </span>{" "}
              tại nhà hoàn toàn có thể giải quyết được những vấn đề như học viên
              có năng lực yếu thì cần gia sư có tình kiên trì, hoặc với trường
              hợp đặc biệt như trẻ tự kỷ cần có các gia sư về tâm lý trị liệu,…
            </p>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <img
              src="https://giasuongmattroi.com/wp-content/uploads/2023/03/tiet-kiem-thoi-gian-nho-hoc-gia-su-day-kem-tai-nha.jpg"
              alt="Tiết kiệm thời gian nhờ học gia sư dạy kèm tại nhà (Nguồn: Unsplash)"
              width={500}
            />
            <p>Tiết kiệm thời gian nhờ học gia sư dạy kèm tại nhà</p>
            <p>(Nguồn: Unsplash)</p>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <img
              src="https://giasuongmattroi.com/wp-content/uploads/2023/03/gia-su-day-kem-co-nhung-phuong-phap-hoc-tap-toi-uu.jpg"
              alt="Gia sư dạy kèm có những phương pháp học tập tối ưu"
              width={500}
            />
            <p>Gia sư dạy kèm có những phương pháp học tập tối ưu</p>
            <p>(Nguồn: Unsplash)</p>
          </div>
          <div className="text-justify">
            <h3 className="font-bold text-red-600">
              1.4. Tăng cường khả năng rèn luyện
            </h3>
            <p>
              Học tập cùng gia sư tại nhà tăng sẽ giúp cho học viên có nhiều cơ
              hội rèn luyện, thực hành hơn, ví dụ như đối với trường hợp học
              viên có kiến thức còn yếu, gia sư toán và xã hội sẽ là người giúp
              củng cố lại kiến thức, sửa chữa và góp ý các bài tập kỹ càng.
            </p>
            <p>
              Đặc biệt với môn Tiếng Anh, học gia sư dạy kèm tại nhà giúp đẩy
              nhanh hiệu quả của việc thực hành tiếng anh khi gia sư có thể góp
              ý và chỉnh ngay các lỗi mà học viên mắc phải.{" "}
              <span className="font-semibold text-red-500">
                Trung tâm gia sư uy tín
              </span>{" "}
              và mọi thắc mắc sẽ được giải quyết kịp thời và nhanh chóng nhất.
            </p>
            <h3 className="font-bold text-red-600">1.5. Giờ giấc linh hoạt</h3>
            <p>
              Khác với việc phải sắp xếp công việc để phù hợp với thời khoá biểu
              đã được sắp xếp sẵn ở các lớp học thêm, các trung tâm thì học viên
              có thể tự mình xếp lịch học vào thời gian phù hợp nhất với bản
              thân.
            </p>
            <p>
              {" "}
              Ngoài ra khi có bất kỳ mong muốn thay đổi lịch học khi có công
              việc bận. Học viên hoàn toàn có thể trao đổi và sắp xếp với giáo
              viên toán và xã hội. Vì thế, việc chi trả{" "}
              <span className="text-semibold text-red-500">
                bảng giá gia sư
              </span>{" "}
              có thể sẽ cao hơn nhưng nó xứng đáng với những gì bạn nhận được
            </p>
          </div>

          <div className="text-justify">
            <h3 className="font-bold text-red-600">1.6. Gắn bó với học viên</h3>
            <p>
              Việc học kèm 1-1 hoặc nhóm nhỏ tạo cảm giác an tâm trong việc học
              cho học viên. Bên cạnh đó gia sư cũng trở thành nơi vững chắc để
              học viên có thể trao đổi bất kỳ vấn đề mình mắc phải ảnh hưởng đến
              học tập, cũng như các vấn đề khác. Vì tiếp xúc trực tiếp gần gũi,
              gia sư dần sẽ trở nên thân thiết và gắn bó nhiều hơn với học viên
              của mình.
            </p>
            <h3 className="font-bold text-red-600">
              1.7. Phụ huynh dễ dàng trao đổi
            </h3>
            <p>
              Gia sư dạy kèm là người nắm rõ quá trình học tập của học viên, vì
              thế phụ huynh dễ dàng trao đổi với gia sư để chủ động kiểm soát
              việc học của con em mình, bên cạnh đó, phụ huynh còn có thể yêu
              cầu gia sư điều chỉnh cách dạy sao cho phù hợp với khả năng của
              học viên nhất.
            </p>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <img
              src="https://giasuongmattroi.com/wp-content/uploads/2023/03/hoc-vien-co-the-tu-minh-xep-lich-hoc-vao-thoi-gian-phu-hop-nhat-voi-ban-than.jpg"
              alt="Học viên có thể tự mình xếp lịch học vào thời gian phù hợp nhất với bản thân"
              width={500}
            />
            <p>
              Học viên có thể tự mình xếp lịch học vào thời gian phù hợp nhất
              với bản thân
            </p>
            <p>(Nguồn: Unsplash)</p>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <img
              src="https://giasuongmattroi.com/wp-content/uploads/2023/03/phu-huynh-con-co-the-yeu-cau-gia-su-dieu-chinh-cach-day.jpg"
              alt="Phụ huynh còn có thể yêu cầu gia sư điều chỉnh cách dạy"
              width={500}
            />
            <p>Gia sư dạy kèm có những phương pháp học tập tối ưu</p>
            <p>(Nguồn: Unsplash)</p>
          </div>
          <div className=" text-justify">
            <div>
              <h3 className="font-bold text-red-600 text-[18px]">
                2. Gia Sư Ông Mặt Trời – dạy kèm chất lượng, uy tín
              </h3>
              <h3 className="font-bold text-red-600">
                2.1. Hiểu tâm lý học viên
              </h3>
              <p>
                Được hình thành với sự thông hiểu tâm lý mệt mỏi, khổ sở của học
                viên khi gặp các trung tâm lừa đảo hay những gia sư không chất
                lượng. Gia Sư Ông Mặt Trời là cầu nối đáng tin cậy giữa phụ
                huynh và gia sư với{" "}
                <span className="font-semibold text-red-500">
                  bảng giá gia sư
                </span>{" "}
                phù hợp nhất. Với nhiều năm kinh nghiệm trong nghề, gia sư tại
                đây đều hiểu rõ rằng nội dung nào khó, nội dung nào dễ khiến học
                viên của mình nản lòng để từ đó có thể hỗ trợ dạy chi tiết hơn
                và có những sự động viên dành cho học viên của mình.
              </p>
              <p>
                {" "}
                Vì thế mà học viên có thể tiết kiệm được nhiều thời gian, công
                sức cho việc di chuyển để có thể dành nhiều thời gian và sức lực
                để việc học đạt hiệu quả cao
              </p>
              <h3 className="font-bold text-red-600 text-[18px]">
                2. Gia Sư Ông Mặt Trời – dạy kèm chất lượng, uy tín
              </h3>
              <h3 className="font-bold text-red-600">
                2.2. Đội ngũ quản lý chuyên nghiệp
              </h3>
              <p>
                Trung tâm Gia Sư Ông Mặt Trời được sáng lập bởi các giáo viên,
                Thạc sĩ trong ngành giáo dục – những người nắm rõ chương trình
                đào tạo cũng như được đào tạo bài bản về sự nghiệp dạy người.
                Với các chuyên ngành khác nhau và năng lực cao, trung tâm luôn
                đảm bảo trình độ chuyên môn của gia sư.
              </p>
              <p>
                Khi các bậc phụ huynh trao đổi tìm hiểu về{" "}
                <span className="font-semibold text-red-500">
                  bảng giá gia sư
                </span>
                , phía trung tâm sẽ cung cấp các thông tin chi tiết về gia sư
                như thông tin cá nhân, trình độ học vấn cũng như các bằng cấp
                liên quan về gia sư để phụ huynh nắm rõ trước khi ra quyết định
                thuê gia sư.
              </p>
            </div>
          </div>

          <div className="text-justify">
            <h3 className="font-bold text-red-600">
              2.3. Tận tình vì hiệu quả học tập
            </h3>
            <p>
              Trung tâm Gia Sư Ông Mặt Trời luôn luôn đáp ứng đầy đủ những ưu
              điểm của gia sư tại nhà đem đến. Với việc tư vấn miễn phí, được
              đổi gia sư, giờ học – địa điểm học linh hoạt, báo cáo kết quả hàng
              tháng đến phụ huynh/ học viên.
            </p>
            <p>
              Đây cũng chính là điểm khác biệt so với một số trung tâm khác. Phụ
              huynh có thể liên lạc thay đổi giờ học với gia sư nếu gia đình có
              việc và được sắp xếp học bù vào buổi khác thay vì mất luôn kiến
              thức của buổi học như tại các trung tâm học trực tiếp. Ngoài ra,
              phía ra sư sẽ thường xuyên có các bài kiểm tra đánh giá năng lực
              của học viên để phụ huynh nắm được tình hình học tập của con em
              mình.
            </p>
            <p>
              Bài viết trên đã cung cấp bảng{" "}
              <span className="font-semibold text-red-500">báo giá gia sư</span>{" "}
              tại trung tâm Gia Sư Ông Mặt Trời một cách chi tiết nhất. Mong
              rằng qua bài viết này, quý bạn đọc sẽ tìm được một gia sư hài lòng
              nhất cho con của mình.
            </p>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <img
              src="https://giasuongmattroi.com/wp-content/uploads/2023/03/trung-tam-luon-dam-bao-trinh-do-chuyen-mon-cua-gia-su.jpg"
              alt="Trung tâm luôn đảm bảo trình độ chuyên môn của gia sư"
              width={500}
            />
            <p>Trung tâm luôn đảm bảo trình độ chuyên môn của gia sư</p>
            <p>(Nguồn: Unsplash)</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FeesPage;
