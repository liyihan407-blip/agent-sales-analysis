# 集驰销售助手 · uni-app 移动端

Vue 3 + uni-app CLI 工程，目标为微信小程序、Android/iOS App，并提供 H5 开发预览。与同目录中的 `jc-sales-agent` Java 后端共用接口，PC 网页仍在 `jc-sales-agent-front`。

## 已实现

- 员工 ID 登录、Token 保存、登录过期处理、退出登录。
- AI 对话、快捷问题、等待状态、错误提示、复制回答、停止本机等待。
- 新建、切换、搜索和删除会话；删除成功后同步清除服务端该会话记忆。
- 会话按服务器地址和员工 ID 保存在本机，账号切换时隔离；暂不跨设备同步。
- 识别后端 `CHART_JSON:` 格式，用 uni-app Canvas 展示单系列折线图、柱状图、饼图；原始数据可展开查看。其他图表以数据表展示。
- 我的页面和服务器连接设置。

## 1. 安装与 H5 预览

在本目录运行（建议 Node.js 20 LTS）：

```powershell
npm install
npm run dev:h5
```

打开 `http://localhost:5174`。H5 开发请求通过 Vite 转发至 `http://localhost:8087`。先启动原有 Java 后端以及它需要的数据库和 AI 服务，使用数据库中已有的员工 ID 登录。

可复制 `.env.example` 为 `.env.local` 调整默认地址；修改环境变量后重新启动开发服务。H5 开发代理使用 `VITE_PROXY_TARGET`，小程序、App 和生产 H5 的默认地址使用 `VITE_API_BASE_URL`。页面内的连接设置优先于环境变量。

## 2. 微信小程序

1. 安装微信开发者工具。
2. 在 `src/manifest.json` 的 `mp-weixin.appid` 中填写你自己的微信小程序 AppID；未配置时可根据工具支持情况使用测试号/游客模式预览。
3. 运行 `npm run dev:mp-weixin`。
4. 微信开发者工具导入本项目生成的 `dist/dev/mp-weixin`，不要导入 `src`。
5. 电脑开发工具本地调试可在「详情 → 本地设置」临时关闭合法域名和 HTTPS 校验，并将连接地址设置为 `http://localhost:8087`。
6. 手机真机调试时，在登录页「连接设置」中填写电脑的局域网 IP，例如 `http://192.168.1.10:8087`。手机和电脑需要互通，后端需要允许局域网访问，电脑防火墙需要放行对应端口。

正式版本运行 `npm run build:mp-weixin`，导入 `dist/build/mp-weixin` 上传。正式服务器使用 HTTPS，并在微信后台配置 request 合法域名；不应关闭正式环境域名校验。

## 3. 手机 App

1. 安装带 uni-app 编译和 App 运行插件的 HBuilderX，导入本目录的 CLI 项目。
2. 在 `src/manifest.json` 配置属于你账号的 DCloud AppID（顶层 `appid`）。DCloud AppID 与微信 AppID 是不同的配置。
3. 连接手机，在 HBuilderX 中选择「运行 → 运行到手机或模拟器」。根据 HBuilderX 提示安装运行基座。
4. 连接设置中填入手机能访问的后端地址；真机上的 `localhost` 指手机自身。
5. 发布时使用 HBuilderX 的原生 App 打包流程，配置包名、图标和签名。`npm run build:app` 仅生成 App 前端资源，不会直接生成 APK/IPA；iOS 安装和分发还需要相应的苹果签名配置。

## 4. 接口对应关系

| 方法 | 路径 | 用途 |
|---|---|---|
| POST | `/auth/login` | `{ repId: 数字 }`，返回 `{ token, username, role }` |
| POST | `/auth/logout` | 退出登录 |
| POST | `/agent/chat` | `{ sessionId, message }`，返回 `{ sessionId, reply, durationMs }` |
| DELETE | `/agent/session/{sessionId}` | 清除服务端对话记忆 |

认证通过请求头 `sa-token` 传递。沿用现有后端的员工 ID 登录协议，当前没有接入微信 OAuth/手机号授权；生产身份认证应随后端认证方案一同完善。

移动端第一版使用完整响应接口，暂未接入 `/agent/chat/stream`，不会逐字输出。停止等待只会取消客户端请求，不保证中断已经开始的服务端模型执行。文本按纯文本显示，Markdown 标记保留，不执行回复中的 HTML。

生产 H5 若与 API 不同源，需要配置后端 CORS，或使用同源反向代理；Vite 开发代理不会在部署后生效。

## 5. 目录

```text
src/
  api/request.js         请求与后端接口
  components/            消息与跨端 Canvas 图表
  pages/chat/            AI 对话
  pages/history/         历史会话
  pages/login/           员工登录
  pages/mine/            我的工作台
  pages/settings/        服务器地址配置
  stores/                Vue 响应式登录、会话状态
  utils/                 存储、解析和会话业务逻辑
  pages.json             页面与底部导航
  manifest.json          各平台配置
tests/                   无需安装依赖即可执行的 Node 测试
```

## 6. 验证与当前限制

```powershell
npm test
npm run build:h5
npm run build:mp-weixin
npm run build:app
```

已执行回复/图表解析、会话生命周期、取消请求、账号隔离和模拟 `uni.request` 接口测试，并使用现有 PC 工程的 Vue 编译器检查全部 8 个 Vue 文件及 JSON 配置。

创建时环境无法解析 npm 域名（`ENOTFOUND registry.npmjs.org`），未能安装 uni-app 依赖，因此还未完成 uni-app 三端编译、微信开发者工具预览或手机真机测试；也没有连接实际 Java 后端验证业务数据。恢复依赖下载后，请先执行上面的构建命令，再按各平台步骤预览。AppID 和签名需要填写你自己的配置。
