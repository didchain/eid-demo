var recivedMsgHandle = function (message) {
  $("#recMsg").text(message);
};

var iframeUrl = "http://eid.baschain.cn/qrcode.html"; // "http://eid.baschain.cn/qrcode.html";

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
    },
  }
);
