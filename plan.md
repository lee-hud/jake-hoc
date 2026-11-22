# Kế hoạch: tra cứu nguyên câu và dịch nói chuyên ngành

## Mục tiêu và phạm vi

Mở rộng trang Từ điển để nhận câu/cụm dài thay vì chỉ từ đơn; hiển thị các mục HSK tìm thấy bên trong câu. Thêm giao diện dịch nói tiếng Trung–tiếng Việt với hai chiều thủ công và chế độ tự nhận diện chiều theo ngôn ngữ đang nói; bộ chọn ngành gồm kỹ thuật/công nghệ, thương mại/xuất nhập khẩu, sản xuất/cơ khí, y tế, pháp lý và mục ngành tự nhập. Người dùng có thể chọn chiều nói, dùng micro hoặc nhập/sửa văn bản.

Người dùng đã chọn mô hình tự host trên máy chủ riêng và muốn xem trước giao diện trước. Giai đoạn hiện tại chỉ làm bản xem trước UI và tra cứu câu cục bộ; không giả lập bản dịch thật. Sau khi người dùng duyệt giao diện, mới tích hợp backend kết nối endpoint của mô hình tự host. Khóa truy cập, nếu endpoint yêu cầu, chỉ nằm ở máy chủ. Ứng dụng phải nêu rõ bản dịch y tế/pháp lý là tham khảo, không thay tư vấn hoặc bản dịch được chứng nhận.

## Thiết kế

Tái sử dụng thiết kế mobile-first hiện có của Jake Học: nền giấy ấm, thẻ bo góc, màu gạch/đỏ trầm và chữ Hán nổi bật. Không thêm trang điều hướng mới; mở rộng ngay trong Từ điển để việc tra cứu, nghe và dịch không tách khỏi dữ liệu từ HSK. Các điều khiển micro có trạng thái nghe/dừng, văn bản nhận dạng có thể chỉnh sửa, và thông báo quyền micro rõ ràng.

## Kiến trúc và tệp

- `src/pages/DictionaryPage.tsx`: giữ bộ lọc HSK/trạng thái; nhận câu tiếng Trung, tiếng Việt, pinyin hoặc tiếng Anh; ngoài khớp toàn chuỗi còn liệt kê mục HSK có mặt trong câu.
- `src/components/TranslationPanel.tsx`: giao diện chọn tự nhận diện/Trung→Việt/Việt→Trung, ngành, nhập câu, micro, transcript và vùng kết quả; ở bản xem trước ghi rõ chế độ tự nhận diện và mô hình chưa được kết nối.
- `src/lib/speech-recognition.ts`: tái sử dụng Web Speech API cho `zh-CN` và `vi-VN`, giữ nguyên API luyện phát âm hiện có.
- `src/lib/translation.ts`: kiểu dữ liệu/ngôn ngữ/ngành và client API cho giai đoạn kết nối sau; không lưu transcript hay âm thanh.
- `src/lib/study.ts`: chuẩn hóa câu và tìm các mục từ vựng bên trong đầu vào mà không bỏ cơ chế tìm từ hiện tại.
- Giai đoạn kết nối sau duy trì endpoint dịch ở backend tự host, cấu hình địa chỉ/model bằng biến môi trường; Docker/Nginx/Caddy chuyển tiếp `/api/translate` tới dịch vụ. Frontend không được đóng gói khóa hoặc gửi thẳng tới nhà cung cấp ngoài.

## Cấu trúc dự án

- `src/pages/`: các trang hiện có, trong đó `DictionaryPage.tsx` chứa tra cứu và công cụ dịch.
- `src/components/`: component giao diện dùng lại, thêm `TranslationPanel.tsx`.
- `src/lib/`: chuẩn hóa/tìm dữ liệu HSK, nhận diện giọng nói và client dịch.
- `public/data/`: bộ từ HSK tĩnh hiện có, giữ nguyên 5.000 mục.
- `server/` và Docker Compose: chỉ bổ sung ở giai đoạn kết nối mô hình tự host sau khi giao diện được duyệt.

## Giới hạn

Web Speech API phụ thuộc trình duyệt, quyền micro, HTTPS và thường cần mạng. Bản xem trước không thể xác nhận chất lượng thuật ngữ thực tế vì chưa gọi mô hình. Độ chính xác chuyên ngành khi chạy thật phụ thuộc mô hình tự host và bảng thuật ngữ được chuyên gia duyệt.
