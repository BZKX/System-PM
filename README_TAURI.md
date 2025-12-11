# Tauri 迁移指南

本项目已集成 [Tauri](https://tauri.app/)，可以编译为 macOS 和 Windows 桌面应用。

## 1. 环境准备

在开始之前，你需要在本地安装 Rust 编程语言和相关构建工具。

### macOS
1. 安装 CLang 和 macOS 开发依赖：
   ```bash
   xcode-select --install
   ```
2. 安装 Rust：
   ```bash
   curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
   ```

### Windows
1. 安装 [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)。
2. 安装 [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)。
3. 安装 Rust：下载并运行 [rustup-init.exe](https://win.rustup.rs/)。

验证安装是否成功：
```bash
cargo --version
```

## 2. 开发与运行

### 启动开发环境
这会同时启动前端服务和 Tauri 窗口：
```bash
pnpm tauri dev
```
*(首次运行时，Rust 会下载大量依赖并编译，可能需要几分钟，请耐心等待)*

### 构建安装包
构建生产环境的 `.dmg` (macOS) 或 `.exe` (Windows)：
```bash
pnpm tauri build
```
构建产物将位于 `src-tauri/target/release/bundle/` 目录下。

## 3. 常见问题

- **Q: 为什么第一次启动这么慢？**
  A: Rust 需要编译所有依赖库。后续增量编译会很快。

- **Q: 报错 `openssl` 缺失？**
  A: 请确保根据 Tauri 官方文档安装了对应系统的 OpenSSL 库。

- **Q: 数据去哪了？**
  A: 桌面版应用依然复用 Web 版的 `LocalStorage` 逻辑，数据存储在 Tauri 的 WebView 容器中。不同平台的数据是隔离的（Web浏览器数据不会自动同步到桌面APP）。
