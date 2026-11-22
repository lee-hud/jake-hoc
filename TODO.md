# TODO · Jake Học

## PWA mobile-first dùng được trên Android và lưu tiến độ cục bộ
- Ứng dụng PWA thân thiện với điện thoại, có thể thêm lên màn hình chính Android.
- Cache tài nguyên đã tải để hỗ trợ sử dụng lại; không cần tài khoản hoặc đồng bộ đám mây trong bản đầu.
- Tiến độ học lưu trên thiết bị, gồm số từ đã học/đúng và tùy chọn đặt lại.
- Dữ liệu theo HSK 2.0 sáu cấp cũ; cảnh báo rõ nghĩa tiếng Việt có thể được dịch tự động và cần đối chiếu.
- Trạng thái: Đã triển khai; `pnpm typecheck` và production build qua. Manifest và service worker được phục vụ/đăng ký trong Preview; production build precache 16 tài nguyên (1,07 MiB) và không precache audio. Audio HSK1 được cache theo nhu cầu sau lần nghe thử. Chưa xác minh thao tác “Thêm vào màn hình chính” trên điện thoại Android thật.

## Flashcard và đánh dấu mức độ nhớ
- Flashcard hiển thị chữ Hán, pinyin, nghĩa tiếng Việt và từ loại.
- Cho phép người học tự đánh dấu đã nhớ hoặc cần ôn.
- Trạng thái: Đã kiểm tra trên Preview: lật thẻ, xem nghĩa/pinyin và đánh dấu “Cần ôn lại” cập nhật tiến độ.

## Luyện gõ chữ Hán bằng Pinyin
- Người học xem từ/câu hỏi rồi nhập chữ Hán bằng bàn phím Pinyin.
- Ứng dụng tự kiểm tra câu trả lời và cho phép thử lại.
- Trạng thái: Đã kiểm tra trên Preview: nhập đáp án 本 được nhận đúng, hiện phản hồi và tăng thống kê.

## Quiz trắc nghiệm theo cấp và nội dung cần ôn
- Có câu hỏi trắc nghiệm chọn chữ Hán hoặc nghĩa.
- Có thể chọn cấp HSK và luyện các mục cần ôn.
- Trạng thái: Đã kiểm tra quiz HSK 1 tạo 10 câu, chọn đáp án đúng, hiện pinyin/kết quả và tiếp tục câu tiếp theo.

## Tra cứu 5.000 mục HSK 1–6
- Có thể tìm trong 5.000 mục theo chữ Hán, pinyin có hoặc không dấu thanh/khoảng trắng, nghĩa tiếng Việt, gloss tiếng Anh và từ loại.
- Có thể kết hợp tìm kiếm với bộ lọc theo cấp HSK và trạng thái học; có phân trang và xóa nhanh truy vấn.
- Trạng thái: Đã xác nhận đủ 5.000 mục, đúng phân bố 150/150/300/600/1.300/2.500. Trên Preview, “diannao” và “dian nao” đều tìm ra “电脑”; nghĩa “máy tính” trả các mục liên quan. Bộ lọc cấp HSK/trạng thái, phân trang và xóa nhanh vẫn khả dụng.

## Phát âm MP3 theo mục và tải theo nhu cầu
- Có thể phát file MP3 của từng mục.
- Audio tải theo cấp khi cần để hạn chế dữ liệu phải tải lúc đầu.
- Trạng thái: Sáu ZIP đã kiểm tra toàn vẹn; tên MP3 khớp chính xác id đủ 5.000 từ. Lần nghe thử tải/cache gói HSK1 trong runtime cache, không nằm trong app precache; tải các cấp khác chỉ khi cần.

## Theo dõi tiến độ trên thiết bị
- Hiển thị số từ đã học/đúng.
- Có tùy chọn đặt lại tiến độ.
- Tiến độ lưu cục bộ, không yêu cầu tài khoản hay đồng bộ đám mây.
- Trạng thái: Đã kiểm tra localStorage cập nhật sau flashcard và quiz, thống kê tổng/theo cấp hiển thị trong Tiến độ. Các dấu thử nghiệm đã được xóa để Preview trở về 0; nút đặt lại có xác nhận trước khi xóa.

## Ghi công dữ liệu
- Nêu nguồn dữ liệu HSK, từ điển/gloss và nguồn/giấy phép audio trong app.
- Trạng thái: Đã triển khai và kiểm tra phần ghi công trong Tiến độ, có liên kết nguồn/giấy phép; có cảnh báo nghĩa tiếng Việt được dịch tự động.

## Đổi tên hiển thị ứng dụng
- Tên app hiển thị là “Jake Học” thay cho “Hanzi Học” ở tiêu đề, thanh đầu trang, màn hình cài đặt và manifest PWA.
- Trạng thái: Hoàn tất — title trình duyệt, header, hướng dẫn cài đặt, route manifest và tên/short name PWA đã được đổi sang “Jake Học”.

## Nhận diện thương hiệu Jake
- Tên hiển thị trên ứng dụng là “Jake Học”; không hiển thị nhãn thương hiệu ngoài ứng dụng.
- Trạng thái: Hoàn tất — giữ nguyên các cài đặt khác và analytics; không tự động xuất bản.

## Tra cứu cụm từ và nguyên câu
- Ô từ điển nhận cả câu tiếng Trung, tiếng Việt, pinyin hoặc tiếng Anh; tìm và liệt kê các mục HSK có trong câu, đồng thời giữ bộ lọc cấp HSK/trạng thái, phân trang và thao tác xóa truy vấn.
- Cho phép đưa nguyên câu từ ô tra cứu sang công cụ dịch mà không phải nhập lại.
- Trạng thái: Đã triển khai và kiểm tra Preview với câu mẫu “我想了解这台设备的价格和交货时间。”; tìm được 12 mục HSK chứa trong câu, gồm 价格, 时间 và 设备. Bộ lọc và đánh dấu từ vẫn giữ nguyên.

## Xem trước dịch nói chuyên ngành Trung–Việt
- Có hai chiều thủ công Trung→Việt và Việt→Trung, cùng chế độ tự nhận diện chiều theo ngôn ngữ đang nói: tiếng Trung → tiếng Việt, tiếng Việt → tiếng Trung; người học có thể nhập/sửa câu nhận dạng trước khi dịch.
- Có bộ chọn ngành: kỹ thuật/công nghệ, thương mại/xuất nhập khẩu, sản xuất/cơ khí, y tế, pháp lý và ngành tự nhập.
- Hiển thị transcript, trạng thái micro, lỗi quyền/trình duyệt và vùng kết quả; người dùng có thể nhập văn bản nếu micro không hỗ trợ.
- Bản xem trước phải nêu rõ chưa kết nối mô hình, không trình bày bản dịch mẫu như kết quả thật; tính năng chạy thật sẽ dùng mô hình tự host, không gửi câu tới API đám mây hay lưu bản ghi.
- Nêu rõ bản dịch chuyên ngành là tham khảo, không thay bản dịch được chứng nhận hoặc tư vấn y tế/pháp lý.
- Trạng thái: Đã triển khai giao diện xem trước với hai chiều thủ công và lựa chọn tự nhận diện; chế độ tự nhận diện được ghi rõ cần mô hình tự host nên chưa hoạt động thật. Chưa kiểm tra mic trên thiết bị thật; backend mô hình tự host và bản dịch thật chưa được triển khai.

## Luyện phát âm tiếng Trung
- Trong phiên học, nghe âm mẫu rồi dùng micro để đọc từ tiếng Trung; hiển thị chữ được nhận diện và phản hồi nếu khớp với từ mục tiêu.
- Cho phép thử lại hoặc chuyển từ; nếu trình duyệt không hỗ trợ nhận diện tiếng Trung, thông báo rõ và cung cấp cách tự đánh giá.
- Nêu rõ quyền micro, yêu cầu mạng/khả năng hỗ trợ của trình duyệt, giới hạn chấm theo chữ nhận diện và việc ứng dụng không lưu bản ghi.
- Trạng thái: Hoàn tất — đã kiểm tra Preview với transcript giả lập: khớp chữ cập nhật tiến độ, chuyển sang từ kế; đã kiểm tra nhánh trình duyệt không hỗ trợ và tự đánh giá. Preview hiện từ chối quyền micro nên chưa xác minh nhận dạng âm thanh thực tế trên thiết bị.
