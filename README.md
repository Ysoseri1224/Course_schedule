# 创锦一对一雅思课程排课系统

## 项目简介
基于Electron的桌面应用，用于管理一对一雅思课程的学生课表、教师排班和总课表。

## 功能特性
- ✅ 学生课表管理
- ✅ 教师排班表管理
- ✅ 一周总课表查看
- ✅ 三表联动同步更新
- ✅ 课时统计自动计算
- ✅ 课表导出为PNG（样式完全还原模板）
- ✅ 本地数据库存储（Better-SQLite3）
- ✅ 零配置开箱即用

## 安装和运行

### 开发环境

1. 安装依赖
```bash
npm install
```

2. 启动开发服务器
```bash
npm run electron:dev
```

### 生产打包

```bash
npm run electron:build
```

打包后的安装程序位于 `dist-electron` 目录。

## 技术栈
- Electron 28
- React 18
- Vite 5
- Ant Design 5
- TailwindCSS 3
- Better-SQLite3
- Zustand
- html2canvas

## 项目结构
```
schedule-system/
├── electron/           # Electron主进程
│   ├── main.js        # 入口文件
│   ├── preload.js     # 预加载脚本
│   ├── database/      # 数据库模块
│   ├── services/      # 业务逻辑
│   └── ipc/           # IPC通信
├── src/               # React渲染进程
│   ├── components/    # 组件
│   ├── store/         # 状态管理
│   └── utils/         # 工具函数
└── resources/         # 应用资源
```

## 使用说明

1. 添加学生和教师
2. 为学生分配各科目的授课教师
3. 在课表中点击单元格添加课程
4. 课表自动同步更新
5. 导出PNG格式课表

## 数据存储

数据存储在用户目录：
- Windows: `C:\Users\{用户名}\AppData\Roaming\创锦排课系统\`
- macOS: `~/Library/Application Support/创锦排课系统/`
- Linux: `~/.config/创锦排课系统/`

## 许可证
MIT
