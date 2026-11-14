# 部署与配置

## 运行依赖

Compose 包含 MySQL、Redis、Java 后端、Nginx 和两个网页构建目标。不包含模型服务本身，需要自备模型 API Key。Docker 不会编译微信小程序或打包 APK/IPA；uni-app 的 H5 版本用于浏览器预览。

## 配置表

| 变量 | 用途 |
|---|---|
| `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` | 应用数据库账号与管理账号密码 |
| `REDIS_PASSWORD` | 私有网络 Redis 密码 |
| `AI_API_KEY` | 服务端模型凭据，不注入前端 |
| `AI_BASE_URL` / `AI_MODEL_NAME` | OpenAI 兼容模型地址与模型名 |
| `BIND_ADDRESS` | 默认 `127.0.0.1`，只允许本机访问 |
| `WEB_PORT` / `MOBILE_PORT` | PC 与移动 H5 入口，默认 8080 / 8081 |

请使用独立的随机密码，不要把 `.env` 上传到 GitHub。若值包含美元符号等特殊字符，请遵循 Compose `.env` 的引号与插值规则。运行 `docker compose config --quiet` 检查配置，避免把展开后包含密钥的完整配置复制到公开日志。

## 本地开发

公开的 `application.yml` 使用环境变量。可建立被 Git 忽略的 `application-local.yml` 保存自己的配置，Spring 会在本地导入它。本地配置不会进入容器，因此 Docker 中以 Compose 注入的变量为准。

如果原本的本地配置覆盖了公开配置，需确认 `sa-token.token-name` 与前端发送的 `sa-token` 请求头一致，并启用 `app.auth.enabled` 才会执行登录拦截。

## 数据持久化

MySQL 与 Redis 使用命名数据卷。首次创建 MySQL 数据目录时按 `01-schema.sql`、`02-demo.sql` 顺序执行建表和演示数据；已有数据卷不会重复执行。更改初始化脚本后，已有库应使用单独的迁移方式处理。

`docker compose down` 不删除命名卷；`docker compose down -v` 会删除数据库数据，不应当作普通重启命令。后端 `DB_INIT_MODE` 默认 `never`，避免每次重启执行包含 DELETE 的演示数据脚本。

## 网络与反向代理

仅 Nginx 对宿主机开放端口。MySQL、Redis 使用内部网络；Java 同时连接业务网络和网页网络，以便调用外部模型服务。Nginx 兼容 PC 现有 `/auth`、`/agent` 路径和移动端 `/api` 前缀，关闭响应缓冲以支持 PC SSE。

手机真机在同一局域网访问时，可将 `BIND_ADDRESS` 改为 `0.0.0.0`，使用电脑局域网 IP。正式公网入口需配置 HTTPS、真实登录认证和服务限流；不要直接开放数据库、Redis 或工具测试接口。

## 验证限制

当前仅准备并发布源码与容器配置，未在这里启动整栈。先执行配置检查，再构建镜像并查看 `docker compose ps` 和后端日志；测试真实模型调用时会消耗你自己的模型额度。仓库内 Spring Boot 冒烟测试会连接外部依赖并调用模型，不作为无网络单元测试执行。
