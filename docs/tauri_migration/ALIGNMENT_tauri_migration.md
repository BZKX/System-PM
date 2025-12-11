# ALIGNMENT_tauri_migration

## 1. 任务背景
用户希望将现有的 Web 应用 (System PM) 转换为桌面应用，并明确选择了 **Tauri** 方案。
目标平台：Windows 和 macOS。

## 2. 技术上下文分析
- **当前栈**: React 18 + Vite + TypeScript + Zustand (LocalStorage Persist)。
- **Tauri 优势**: 安装包极小，内存占用低，安全性高。
- **环境要求**:
    - **Rust**: Tauri 的后端依赖 Rust 编译环境。
    - **Node.js**: 前端构建依赖。
    - **系统依赖**:
        - macOS: Xcode Command Line Tools.
        - Windows: C++ Build Tools, WebView2.

## 3. 核心需求
1.  **初始化 Tauri**: 在现有项目中集成 Tauri。
2.  **配置适配**: 修改 `vite.config.ts` 和 `tauri.conf.json` 以适配项目。
3.  **功能迁移与增强**:
    - 保持现有功能 (LocalStorage) 可用。
    - *进阶 (Optional)*: 利用 Tauri 的 FS API 替代 LocalStorage 实现真正的本地文件读写 (这能彻底解决浏览器缓存易丢失的问题)。鉴于这是迁移的第一步，我们先确保 **"Web 容器化"** 成功，即先跑起来，数据层暂保持不变或做最小适配。
4.  **构建流水线**: 确保能 build 出 `.dmg` (Mac) 和 `.exe` / `.msi` (Windows)。

## 4. 智能决策策略
- **数据存储**: 目前使用 Zustand + LocalStorage。Tauri 应用本质上也是运行在 Webview 中，LocalStorage **依然可用**。因此，MVP (第一阶段) 不需要重写数据层，直接复用即可。
- **窗口配置**: 设置合适的默认窗口大小 (1200x800)，并配置标题栏。
- **权限**: 初始阶段只需基础权限，后续若增加“导出到本地文件系统”功能，需配置 `fs` 权限。

## 5. 迁移步骤
1.  **环境检查**: 确认 Rust 环境是否安装（这一步通常由用户在本地完成，但我需要提供指引或尝试检测）。
2.  **依赖安装**: `pnpm add -D @tauri-apps/cli @tauri-apps/api`。
3.  **Tauri 初始化**: `pnpm tauri init`。
4.  **配置修改**:
    - `package.json`: 添加 `tauri` 脚本。
    - `vite.config.ts`: 调整 build 输出目录和 server 配置。
    - `src-tauri/tauri.conf.json`: 配置应用标识、窗口属性。
5.  **运行验证**: `pnpm tauri dev`。

## 6. 最终共识
- **交付物**: 一个集成了 Tauri 配置的代码库，用户在本地安装好 Rust 环境后，运行命令即可启动桌面端。
- **注意**: 我无法在我的云端环境中直接运行 GUI 应用 (Tauri dev)，也无法安装 Rust 编译器。因此，我的工作重点是 **"生成正确的配置代码和文档"**，并指导用户在本地运行。

---
*Self-Correction*: 我应该先检查当前环境是否有 `cargo` (Rust 包管理器)。如果有，我可以尝试初始化；如果没有，我只能生成文件。
