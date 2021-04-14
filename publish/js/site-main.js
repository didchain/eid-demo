/*
 * @Author: your name
 * @Date: 2021-04-10 01:04:30
 * @LastEditTime: 2021-04-14 12:45:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \.sp-wikie:\EWork\didchain_work\leech-ifr\publish\js\site-main.js
 */
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
 * 设置 iframe 内 二维码大小
 * @returns number
 */
var getSize = function () {
  const size = 400;
  return size;
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
      style: { width: "190px", "min-height": "250px", border: "1px solid red" },
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
            case "setQrcodeSize":
              return {
                erpcMethod: method,
                data: getSize(),
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
