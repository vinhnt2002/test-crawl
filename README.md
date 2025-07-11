# FastMoss Crawler

Một crawler để thu thập dữ liệu sản phẩm từ FastMoss cho TikTok Shop.

## Cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Cấu hình MongoDB:**
   - Cài đặt MongoDB locally hoặc sử dụng MongoDB Atlas
   - Cập nhật connection string trong `config.js`

3. **Cấu hình Proxy:**
   - Proxy đã được cấu hình trong `config.js`
   - Test proxy connection: `npm run test-proxy`

## Cấu trúc thư mục

```
fastmoss/
├── lib/
│   ├── db_tiktokshop.js    # MongoDB connection và setup
│   └── helps.js            # Helper functions và trademark filtering
├── data/
│   └── constant.js         # Constants và time utilities
├── old_/
│   └── src/
│       └── status_product.js # Sleep và utility functions
├── config.js               # Cấu hình application
├── package.json           # Dependencies
└── fassmost_seller_v2.js  # Main crawler script
```

## Sử dụng

### Chạy crawler:
```bash
npm start
```

### Chạy trong development mode:
```bash
npm run dev
```

### Test proxy connection:
```bash
npm run test-proxy
```

## Cấu hình

Cập nhật các thông số trong `config.js`:

- **MongoDB URI**: Connection string cho database
- **Proxy settings**: Cấu hình proxy cho requests
- **Rate limiting**: Thời gian delay giữa các requests
- **Filtering**: Keyword và trademark filtering

## Collections trong MongoDB

- **tiktoks**: Sản phẩm được crawl
- **seller_ids**: Danh sách seller cần crawl
- **keywords**: Keywords để search
- **settings**: Cấu hình trademark blacklist

## Features

- ✅ Crawl products từ sellers
- ✅ Crawl products theo keywords
- ✅ Trademark filtering
- ✅ Rate limiting
- ✅ Error handling và retry logic
- ✅ MongoDB integration
- ✅ Proxy support

## Lưu ý

1. **Proxy**: Bắt buộc phải có proxy để tránh bị block
2. **Rate limiting**: Không nên giảm delay quá thấp
3. **Database**: Đảm bảo MongoDB đang chạy
4. **Trademark**: Cập nhật blacklist trong database nếu cần

## Troubleshooting

- **Connection error**: Kiểm tra MongoDB connection
- **403 errors**: Kiểm tra proxy và cookies
- **Rate limiting**: Tăng delay time trong config #   t e s t - c r a w l  
 