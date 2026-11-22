# Jake Học — chạy trên máy riêng

Ứng dụng PWA React/TypeScript học từ vựng HSK 1–6 bằng tiếng Việt. Bản này không cần tài khoản, backend hay API key; tiến độ được lưu cục bộ trong trình duyệt. Các gói phát âm MP3 nằm trong `public/audio/` và được tải theo cấp khi dùng.

## Yêu cầu

- Node.js 22 trở lên (dự án đã được kiểm tra với Node.js 22).
- pnpm 11.25.0.
- Kết nối Internet lần đầu để cài các package. Google Fonts và nhận diện giọng nói cũng có thể cần mạng.

Cài pnpm nếu máy chưa có:

```bash
npm install --global pnpm@11.25.0
```

Kiểm tra:

```bash
node --version
pnpm --version
```

## Chạy ở chế độ phát triển

Giải nén mã nguồn, mở terminal tại thư mục có `package.json`, rồi chạy:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Mở địa chỉ được Vite hiển thị; mặc định là `http://localhost:3000`.

## Tạo và xem bản build

```bash
pnpm build
pnpm preview
```

Lệnh `pnpm build` chạy TypeScript typecheck và tạo bản production trong `dist/`. `pnpm preview` phục vụ bản đó tại cổng 3000.

## Dùng trên điện thoại

Máy tính và điện thoại có thể cùng Wi-Fi để mở địa chỉ mạng LAN mà Vite hiển thị; có thể cần cho phép cổng 3000 qua firewall. Địa chỉ LAN HTTP phù hợp để xem giao diện, nhưng trình duyệt thường yêu cầu **HTTPS hoặc localhost** để cài PWA và cấp quyền micro. Vì vậy, để thử luyện phát âm hoặc cài lên màn hình chính trên điện thoại, hãy phục vụ ứng dụng qua HTTPS. Trên máy tính, `localhost` là secure context.

Tính năng luyện phát âm dùng Web Speech API của trình duyệt; mức hỗ trợ khác nhau giữa các trình duyệt và dịch vụ nhận diện có thể cần Internet. Nếu không được hỗ trợ, ứng dụng có chế độ tự đánh giá.

## Triển khai bằng GitHub Pages

Mã nguồn đã hỗ trợ build dưới đường dẫn project site `/jake-hoc/`. GitHub Pages chưa được bật cho repository này; cần thêm workflow GitHub Actions và chọn **Settings → Pages → GitHub Actions** trước khi website xuất hiện tại `https://lee-hud.github.io/jake-hoc/`. Khi được xuất bản, có thể cài PWA từ trình duyệt trên điện thoại; dữ liệu từ vựng và gói phát âm được tải từ website.

GitHub Pages chỉ phục vụ tệp tĩnh. Workflow không chạy backend, mô hình Qwen hay API dịch liên tục; vì vậy dịch trực tiếp vẫn cần một máy chủ/backend mô hình riêng và sẽ chưa hoạt động thật khi chưa cấu hình endpoint.

## Triển khai online trên máy chủ riêng (Docker)

Gói mã nguồn có sẵn Dockerfile và Docker Compose để build bản production, phục vụ ứng dụng bằng Nginx và cấp HTTPS tự động bằng Caddy. Cần máy chủ Linux có Docker Engine và Docker Compose v2, một domain/subdomain trỏ tới máy chủ, cùng cổng TCP 80/443 mở trên firewall và router. Caddy dùng cổng UDP 443 cho HTTP/3 nếu mạng cho phép.

1. Giải nén mã nguồn trên máy chủ và mở terminal tại thư mục có `docker-compose.yml`.
2. Tạo cấu hình domain:

   ```bash
   cp .env.example .env
   ```

   Sửa `.env` và thay `jake.example.com` bằng domain thật. Tạo bản ghi DNS A (và AAAA nếu dùng IPv6) trỏ domain tới IP công khai của máy chủ.
3. Mở cổng TCP 80 và 443 tới máy chủ trên firewall/router, rồi chạy:

   ```bash
   docker compose up -d --build
   docker compose ps
   ```

4. Khi DNS đã phân giải tới máy chủ và cổng 80/443 truy cập được từ Internet, mở `https://<domain-của-bạn>`.

Caddy tự xin và gia hạn chứng chỉ HTTPS. HTTPS cần thiết để trình duyệt cho phép cài PWA và cấp quyền micro. Xem nhật ký bằng `docker compose logs -f`; cập nhật ứng dụng sau khi thay mã bằng `docker compose up -d --build`. Dùng `docker compose down` để dừng các container; không thêm `-v` nếu muốn giữ dữ liệu chứng chỉ của Caddy.

Thiết lập mặc định cần dùng riêng cổng 80 và 443. Nếu máy chủ đã có Nginx/Caddy hoặc dịch vụ khác chiếm các cổng đó, cần cấu hình reverse proxy hiện có thay vì bật thêm proxy trong Compose. Nếu máy chủ ở nhà sau router, cần chuyển tiếp cổng và có IP công khai hoặc giải pháp DNS động.

Ứng dụng hiện không có tài khoản hay backend: mỗi người dùng dùng chung website nhưng tiến độ học chỉ lưu trong trình duyệt/thiết bị riêng của họ, không đồng bộ giữa thiết bị hoặc người dùng.

## Dữ liệu và riêng tư

- Từ vựng và MP3 được đóng gói trong thư mục `public/`; audio được tải theo cấp khi nghe.
- Tiến độ chỉ lưu trên thiết bị/trình duyệt đang dùng; xóa dữ liệu trình duyệt có thể xóa tiến độ.
- Không có tài khoản, đồng bộ đám mây hoặc backend trong phiên bản này.
- Nhận diện giọng nói có thể được xử lý bởi dịch vụ của trình duyệt; ứng dụng không lưu bản ghi âm.
