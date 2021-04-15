# EID 区块链身份认证系统集成文档

> 业务管理系统集成 EID 区块链身份认证系统技术说明

### 网站页面集成布局图

![](/assets/img/eid_screen.png)

### 集成代码

- 在网站登录页引入依赖文件包 [easyeid/easyEID.min.js]
- 在网站登录页引入 EID JSON RPC 主文件 [site-main.js]
- 在网站登录页增加 内嵌 EID 二维码 Iframe 页面的容器.
- 修改 site-main.js 文件

### 在网站登录页增加 内嵌 EID 二维码 Iframe 页面的容器.

```html
<html>
  ...
  <body>
    ...
    <!--
      定义 EID 内嵌二维码 Iframe 容器标签
      id 与 site-main.js 保持一致(在文件第30行)
    -->
    <div id="qrcodeIfrBox" class="qrcode-box"></div>
    ...

    <!-- 引入EID 集成js文件 -->
    <script src="./vendors/easyeid/easyEID.min.js"></script>
    <script src="./js/site-main.js"></script>
  </body>
</html>
```

### 修改 site-main.js 文件

> 扫码校验成功返回数据处理

- js 文件头部

```javascript
/**
 * EID Iframe 扫码验证成功后返回的消息数据,json 字符串
 * 系统可根据该消息在此函数内容做相应处理
 * @param {string} message
 */
var recivedMsgHandle = function (message) {
  $(".rec-msg-wrap").removeClass("rec-hide");
  try {
    const json = JSON.parse(message);
    $("#recMsg").text(JSON.stringify(json, null, 2));
  } catch (error) {
    $("#recMsg").text(message);
  }
};
```

> 扫码成功返回数据格式

```json
{
  "result_code": 0,
  "message": "success",
  "data": {
    "redir_url": "http://39.99.198.143:60998/index.html",
    "signature": {
      "content": {
        "auth_url": "http://39.99.198.143:60998/api/verify",
        "random_token": "58zeX9Hz2ro3fFNXhByQgUKAmy5wqVC2fRPSkYLFbuoA",
        "did": "didHAu7RKsFD1a8qAcUDojS7qxe2wC1p2QwcPxJ5mNc5u6B"
      },
      "ext_data": {
        "user_name": "lanbery",
        "password": "123456"
      },
      "sig": "nK2c7vUYJhGm72iX8cn6Jdvbvx3BhJBtS82C6Kn99BYSjtJdqhSsxxLdY4hjSRPbYgEQ6jFhHxcqzvfB7sQgGf9"
    },
    "user_desc": {
      "name": "tssfff-lanbery",
      "unit_name": "testv1.3",
      "serial_number": "admin",
      "did": "didHAu7RKsFD1a8qAcUDojS7qxe2wC1p2QwcPxJ5mNc5u6B"
    }
  }
}
```

> 指定网站 hostname 和 调整 iframe 二维码大小

```javascript
const EJRPC_PROTOCOL_VERSION = "v1"; //

const SIZE_PARAMS = {
  QRCodeSize: 190, // 控制IFRAME 内二维码大小 只接受数字,且大于等于80
  IFRAME_H: 360, // 控制top页面IFRAME 高度
};

const EXPIRED_PERIOD = 18; // 控制二维码过期时间 单位:秒

// line 29:  内嵌 EID 二维码地址
var iframeUrl = "http://eid.baschain.cn/qrcode.html";
// site-main.js line 31 : 不指定则默认当前集成网站的hostname
const siteHostname = "";
```
