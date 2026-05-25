/**
 * 开发模式：生成 dev.html，从 Hono :3000 跳转到 Vite 开发服务器 :4000
 */
const fs = require("fs");
const path = require("path");

const vendorsRoot = path.join(__dirname, "..");
const staticRoot = path.join(vendorsRoot, "static");
const devPort = process.env.YAPI_DEV_CLIENT_PORT || "4000";

const devHtml = `<!DOCTYPE html>
<html lang="zh-cn">
<head>
  <meta charset="utf-8">
  <title>YApi 开发模式</title>
  <script>
    (function () {
      var host = location.hostname || "127.0.0.1";
      var target = "http://" + host + ":${devPort}" + location.pathname + location.search + location.hash;
      location.replace(target);
    })();
  </script>
</head>
<body>
  <p>正在跳转到前端开发服务（端口 ${devPort}）…</p>
  <p>若未自动跳转，请访问 <a id="link">http://127.0.0.1:${devPort}</a></p>
</body>
</html>
`;

fs.mkdirSync(staticRoot, { recursive: true });
fs.writeFileSync(path.join(staticRoot, "dev.html"), devHtml, "utf8");
console.log("已生成 static/dev.html -> 端口", devPort);
