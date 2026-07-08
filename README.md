# Tin tức Ngành Bán Lẻ

Trang tin công khai, tự động thu thập tin tức ngành bán lẻ Việt Nam mỗi tuần (sáng thứ Sáu),
lọc/phân tích và viết tóm tắt bằng AI (Claude).

## Kiến trúc: Core + Module

```
scheduler (GitHub Actions cron)
        │
        ▼
scripts/run-pipeline.ts (điều phối)
        │
        ▼
modules/sources/*  →  modules/analyzer  →  modules/writer  →  modules/publisher
(crawl RSS)           (lọc + chấm điểm AI) (viết tóm tắt AI)   (ghi data + status)
        │
        ▼
   git commit + push  →  Vercel tự động build & deploy
        │
        ▼
   app/ (core Next.js) đọc data/ mới nhất → hiển thị công khai
```

- **Core** (`app/`, `lib/`): chỉ đọc dữ liệu đã publish theo format cố định trong
  `lib/types.ts`, không biết gì về nguồn tin cụ thể.
- **Module nguồn tin** (`modules/sources/`): mỗi nguồn implement interface `Source`
  (`fetchArticles()`).
- **Module phân tích** (`modules/analyzer/`): gọi Claude lọc trùng + chấm điểm liên quan.
- **Module viết** (`modules/writer/`): gọi Claude viết bản tóm tắt tiếng Việt.
- **Module publisher** (`modules/publisher/`): ghi file JSON + cập nhật trạng thái chạy.

### Thêm một nguồn tin RSS mới

1. Tạo file `modules/sources/ten-nguon.ts`:
   ```ts
   import { createRssSource } from "./rss-source";
   export default createRssSource("Tên hiển thị", "https://.../feed.rss");
   ```
2. Import và thêm vào mảng `sources` trong `modules/sources/config.ts`.

Không cần sửa gì ở core, analyzer, writer hay publisher.

### Thêm một nguồn không phải RSS (ví dụ crawl HTML, gọi API riêng)

Tạo file mới trong `modules/sources/` implement trực tiếp interface `Source`
(`modules/sources/types.ts`) — chỉ cần có hàm `fetchArticles(): Promise<Article[]>` — rồi
đăng ký vào `config.ts` như trên.

## Cơ chế đảm bảo tin cậy

- `data/status.json` ghi lại: thời điểm chạy gần nhất, số nguồn thành công, số bài dùng,
  danh sách lỗi. Trang chủ hiển thị trực tiếp thông tin này ở banner đầu trang.
- Lịch sử chạy (thành công/thất bại) nằm ở tab **Actions** của repo GitHub — độc lập với AI.
- Nếu job lỗi, GitHub tự gửi email cảnh báo tới chủ repo.
- `data/raw/YYYY-MM-DD.json` lưu bài gốc song song bản tóm tắt để đối chiếu.
- Một nguồn lỗi không làm sập cả pipeline — các nguồn còn lại vẫn chạy bình thường.

## Cài đặt & chạy local

```bash
npm install
cp .env.example .env.local   # điền ANTHROPIC_API_KEY
npm run pipeline             # chạy thử pipeline, tạo dữ liệu trong data/
npm run dev                  # xem trang web tại http://localhost:3000
```

## Deploy

1. Push repo lên GitHub.
2. Import repo vào Vercel — Vercel tự build & deploy mỗi khi có commit mới trên `main`.
3. Trong repo GitHub, vào **Settings → Secrets and variables → Actions**, thêm secret
   `ANTHROPIC_API_KEY`.
4. Workflow `.github/workflows/weekly-digest.yml` sẽ tự chạy vào sáng thứ Sáu hàng tuần lúc
   06:00 giờ Việt Nam, commit dữ liệu mới → Vercel tự deploy lại. Có thể chạy thử thủ công qua
   tab **Actions → Weekly retail digest → Run workflow**. Lưu ý: lịch cron của GitHub Actions
   chỉ là "best-effort", có thể trễ vài phút đến vài chục phút so với giờ đặt.

## Mở rộng sau này (không thuộc MVP)

- Cảnh báo qua Slack/Zalo thay vì chỉ email GitHub mặc định — thêm 1 bước trong workflow.
- Chạy dày hơn (hàng ngày) nếu sau này thấy tần suất tin tức cần cập nhật nhanh hơn.
- Thêm module lưu trữ khác (DB) nếu lượng dữ liệu vượt quá mức phù hợp cho JSON-in-repo.
