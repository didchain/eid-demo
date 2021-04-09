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

/**
 * http://eid.baschain.cn/qrcode.html release demo
 * https://wechat.baschain.cn/qrcode.html test
 */
var iframeUrl = "http://eid.baschain.cn/qrcode.html"; // "http://eid.baschain.cn/qrcode.html";

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
      style: { width: "100%", height: "430px" },
    },
  },
  {
    local: {
      echo: function (message) {
        console.log("Parent rec: ", message);
        recivedMsgHandle(message);
      },
      eidHandProtocol: function (message) {
        console.log("Top>>>>>>>>>>>>>", message);
        if (typeof message !== "string" || !message.length)
          throw new Error(
            "Check sub iframe is support EID Chain Json RPC Protocol"
          );
        try {
          const eidMsgData = JSON.parse(message);
          if (!eidMsgData.erpcMethod) {
            throw new Error("Message data is not EID Chain JSON RPC protocol");
          }

          const method = eidMsgData.erpcMethod;
          const data =
            siteHostname !== "" ? siteHostname : window.location.hostname;
          switch (method) {
            case "fetchHostname":
              return {
                erpcMethod: method,
                data: data,
              };
            default:
              throw new Error(
                "EID Chain JSON RPC Protocol unspport erpcMethod:[" +
                  method +
                  "]."
              );
          }
        } catch (err) {
          throw err;
        }
      },
    },
  }
);

function buildDidResponse(errMsg, data) {
  const resp = {
    status: 1,
    message: "success",
    data: null,
  };

  if (!errMsg && data) {
    resp.data = data;
  }
  if (errMsg !== "") {
    resp.status = 0;
    resp.message = errMsg;
  }

  return JSON.stringify(resp);
}
