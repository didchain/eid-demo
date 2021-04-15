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
const DEV_MODE = true; //控制打印日志
const EJRPC_PROTOCOL_VERSION = "v1"; //

const SIZE_PARAMS = {
  QRCodeSize: 180, // 控制IFRAME 内二维码大小 只接受数字,且大于等于80
  IFRAME_H: 280, // 控制top页面IFRAME 高度
  IFRAME_W: 220,
};

const EXPIRED_PERIOD = 18; // 控制二维码过期时间 单位:秒

/**
 * http://eid.baschain.cn/qrcode.html release demo
 * https://wechat.baschain.cn/qrcode.html test
 */
var iframeUrl = "https://wechat.baschain.cn/qrcode.html"; // "http://eid.baschain.cn/qrcode.html";

const siteHostname = "";

var rpc = new easyXDM.Rpc(
  {
    isHost: true,
    remote: iframeUrl,
    hash: true,
    protocol: "1",
    container: document.getElementById("qrcodeIfrBox"),
    props: {
      frameBorder: 0,
      scrolling: "no",
      style: {
        width: SIZE_PARAMS.IFRAME_W + "px",
        height: SIZE_PARAMS.IFRAME_H + "px",
      },
    },
  },
  {
    local: {
      echo: function (message) {
        Log("Parent rec: ", message);
        recivedMsgHandle(message);
      },
      eidHandProtocol: function (message) {
        Log("EidHandProtocol>", message);
        let erpcMethod = "";
        if (typeof message === "string") {
          erpcMethod = message;
        } else if (
          typeof message === "object" &&
          typeof message.erpcMethod === "string"
        ) {
          erpcMethod = message.erpcMethod;
        }

        if (!erpcMethod) {
          throw new Error(
            "Check sub iframe is support EID Chain Json RPC Protocol"
          );
        }
        let response = {
          erpcMethod: erpcMethod,
          ver: EJRPC_PROTOCOL_VERSION,
          data: null,
        };

        switch (erpcMethod) {
          case "fetchInitConfig_v1":
            response.data = {
              hostname:
                siteHostname !== "" ? siteHostname : window.location.hostname,
              qrw: SIZE_PARAMS.QRCodeSize,
              expiredPeriod: EXPIRED_PERIOD,
            };

            return response;
          default:
            throw new Error(
              "EID Chain JSON RPC Protocol unspport erpcMethod:[" +
                erpcMethod +
                "]."
            );
        }
      },
    },
  }
);

function Log() {
  DEV_MODE && console.log(arguments);
}
