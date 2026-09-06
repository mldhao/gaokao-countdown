# 高考倒计时 · Gaokao Countdown

一个轻量、无后端、无数据库的静态高考倒计时网页，采用浅蓝色蔚蓝档案风格 UI，支持随机壁纸、随机名言、备考进度、响应式布局和全屏模式。

A lightweight static Gaokao countdown page with a light-blue Blue Archive-inspired UI. It requires no backend or database and includes random wallpapers, random quotes, progress tracking, responsive layouts, and fullscreen mode.

## 功能 Features

- 2027 年 6 月 7 日 09:00（北京时间）倒计时
- 从 2026 年 8 月 30 日开始计算备考进度
- 显示天、时、分、秒和总剩余秒数
- 随机背景图片：电脑使用 `https://api.yppp.net/pc.php`，手机使用 `https://api.yppp.net/pe.php`；全屏统一使用电脑端接口
- 随机备考名言：优先从 Hitokoto（一言）API 获取，网络失败时使用内置文案
- 全屏模式：只保留倒计时、秒数和随机背景；支持全屏换壁纸，操作按钮会自动隐藏
- 手机进入全屏时会尝试自动横屏（浏览器支持时生效）
- 底部友情链接、ICP备案和公安备案占位信息
- 图片加载失败时自动使用蓝色降级背景
- 响应式适配桌面、平板和手机

## 文件结构 File structure

```text
gaokao-countdown-static/
├─ index.html
├─ manifest.webmanifest
├─ assets/
│  ├─ css/app.css
│  └─ js/app.js
└─ README.md
```

## 本地预览 Local preview

无需构建工具。直接使用任意静态 HTTP 服务器打开项目目录，例如：

No build step is required. Serve this directory with any static HTTP server:

```bash
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。/ Then open `http://127.0.0.1:4173/`.

## 1Panel 部署 1Panel deployment

1. 在 1Panel 创建“静态网站”。
2. 将本目录内的 `index.html`、`assets` 和 `README.md` 上传到网站根目录。
3. 使用浏览器访问绑定的域名即可，无需 PHP、MySQL 或安装步骤。

1. Create a **Static Website** in 1Panel.
2. Upload `index.html`, `manifest.webmanifest`, the `assets/` directory, and this README to the site root.
3. Point your domain to the site and enable HTTPS (recommended).
4. Open the domain. PHP, MySQL, and Node.js are not required.

## 配置说明 Configuration

所有配置均为源码级配置，修改后重新上传对应文件即可。/ All settings are source-level settings.

### 考试时间与进度 Countdown and progress

- 考试时间和名言：`assets/js/app.js`
- 名言 API：`assets/js/app.js` 的 `quoteApi`（默认使用 `https://v1.hitokoto.cn/`）
- 随机图片地址：`assets/js/app.js` 的 `desktopBackgroundApi` 和 `mobileBackgroundApi`
- 标题、友链、备案文字：`index.html`
- 颜色、布局和全屏样式：`assets/css/app.css`

时间采用 ISO 8601 格式，`+08:00` 表示北京时间。/ Use ISO 8601 timestamps; `+08:00` means China Standard Time.

### 壁纸接口 Wallpaper APIs

编辑 `assets/js/app.js` 中的 `desktopBackgroundApi` 和 `mobileBackgroundApi`。全屏模式统一使用电脑端接口。/ Edit these constants in `assets/js/app.js`; fullscreen always uses the desktop endpoint.

### 名言接口 Quote API

编辑 `quoteApi`。JSON 响应需包含 `hitokoto` 字段，请求失败会自动回退到内置名言。/ Edit `quoteApi`. The JSON response should contain `hitokoto`; built-in quotes are used on failure.

### 标题、友链和备案 Title, links, and filings

编辑 `index.html` 中的 `<title>`、`#pageTitle`、底部 `<a>`、ICP备案文字、公安备案文字和 `.copyright`。备案信息上线前请替换为真实备案号。/ Replace the title, page title, footer link, ICP/public-security filing text, and copyright text before publishing.

### 颜色和透明度 Colors and opacity

编辑 `assets/css/app.css` 顶部 CSS 变量以及 `.footer`、`.countdown-panel` 和全屏样式，可调整浅蓝色、白色文字、透明度和模糊效果。/ Tune the CSS variables and related selectors to adjust colors, opacity, and blur.
You can also enable GitHub Pages from **Settings → Pages → Deploy from a branch → `main` / `/ (root)`**.

备案文字目前是占位内容，请替换为真实备案号后再上线。
