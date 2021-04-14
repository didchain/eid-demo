(function (options) {
  if (!$) throw new Error("no found jquery.");
  if (!QRCode) throw new Error("unfound QRCode lib.");
  const qrsize = 190;

  const EidFetchHostMsg = {
    erpcMethod: "fetchHostname",
  };
  window.rpc = new easyXDM.Rpc(
    {
      isHost: false,
      //acl: '^(https?:\\/\\/)?([a-zA-Z0-9\\-]+\\.)*baixing.com(\\/.*)?$',
      protocol: "1",
    },
    {
      remote: {
        echo: {},
        eidHandProtocol: {},
      },
    }
  );

  const BASE_URL = "/api/"; // http://eid.baschain.cn
  if (!axios) {
    throw new Error("unfound axios lib.");
  } else {
    // axios.interceptors.request.use((config) => {
    //   config.withCredentials = true;
    //   return config;
    // });

    const $http = axios.create({
      baseURL: BASE_URL,
      timeout: 60000,
      headers: { "Access-Control-Allow-Origin": "*" },
    });

    $http.interceptors.request.use((config) => {
      config.withCredentials = true;
      return config;
    });
    window.$http = $http;
  }

  const qrcodeOptions = {
    version: 13,
    errorCorrectionLevel: "M",
    margin: 1,
    width: qrsize,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  };

  const CanvasId = "__DidQrcodeContainer";

  let $QrCtx = $("#" + CanvasId);

  if (!$QrCtx[0]) {
    throw new Error("miss Qrcode container element.");
  } else {
    $QrCtx.empty();
  }

  let QRTimer = null;
  let CheckTimer = null;

  const MaxPeriod = 10;
  const CheckPeriod = 2500;
  const Modal = function (opts = {}) {
    /** api/check data  */
    this.passedData = null;
    this.leftTimes = MaxPeriod;
    this.width = opts.qrcodeSize || 320;
    this.height = opts.qrcodeSize || 320;
    this.QrOptions = this.qrCtx = $QrCtx;

    this.authState = null;

    this.getAuthState = function () {
      return this.authState;
    };
    this.setAuthState = function (authState) {
      this.authState = authState || null;
    };

    this.getPassedData = function () {
      return this.passedData;
    };

    this.clearPassedData = function () {
      this.passedData = null;
    };
    this.setPassedData = function (data) {
      this.passedData = data;
    };
  };

  Modal.prototype.setLeftTime = function (num) {
    if (num <= 0) {
      this.leftTimes = 0;
      // clear
    } else {
      this.leftTimes = num;
    }

    fillLeftTimeText(num);
  };
  Modal.prototype.getLeftTime = function () {
    return this.leftTimes < 0 ? 0 : this.leftTimes;
  };

  Modal.prototype.getQrOptions = function (size) {
    let _size = qrcodeOptions.width;
    if (typeof size === "number" && size >= 80 && size <= 600) {
      _size = size;
    }

    return Object.assign({}, qrcodeOptions, { width: _size });
  };

  Modal.prototype.createQrcode = function (text, size) {
    if (typeof text !== "string" || !text.trim().length) {
      throw new Error("Text must string.");
    }

    const _canvas = createCanvas(this.qrCtx);

    const _opts = this.getQrOptions(size);
    console.log(">>>>>>>>>>>>", _opts);
    QRCode.toCanvas(_canvas[0], text, _opts, function (err) {
      if (err) {
        console.log("create Qrcode fail", err);
      } else {
        fillLeftTimeText(MaxPeriod);
        console.log("create qrcode success");
      }
    });
  };

  window.didChainAuthor = new Modal(options || {});
  createQrcodeHandler("init");

  // init

  // window.didChainAuthor.createQrcode("sdhhsdfh", 320);

  $("#DidRefreshBtn").on("click", function (e) {
    createQrcodeHandler("Click Refresh");
  });

  $("#DidQrMask").on("click", function (e) {
    createQrcodeHandler("Click Mask Refresh");
  });

  $("#DidMaskTipBtn").on("click", function (e) {
    createQrcodeHandler("Click Mask Refresh");
  });

  // $("#testBtn").on("click", function (e) {
  //   const msg = {
  //     erpcMethod: "fetchHostname",
  //   };
  //   rpc.didHandProtocol(
  //     JSON.stringify(msg),
  //     function (erpcResponse) {
  //       console.log("testBtn>>>>>", erpcResponse);
  //     },
  //     function (erpcError) {
  //       console.log("Fetch hostname fail.", erpcError);
  //     }
  //   );
  // });
  /* ----------------------- function ------------------------------- */
  function initQrcodeSize() {}
  function createQrcodeHandler(tag) {
    console.log("QRcode create tag:", tag);
    const fetchHostMsgString = JSON.stringify(EidFetchHostMsg);

    rpc.eidHandProtocol(
      fetchHostMsgString,
      function (erpcResponse) {
        if (!erpcResponse) {
          console.warn(
            "Check whether the top page integrates EID Chain JSON RPC protocol."
          );
        } else if (
          erpcResponse.erpcMethod !== "fetchHostname" ||
          !erpcResponse.data
        ) {
          // ignore other message
        } else {
          const hostname = erpcResponse.data;
          //?hostname=" + hostname
          $http
            .get("auth?hostname=" + hostname)
            .then((resp) => {
              console.log(">>>>>>>>axios>>>>>>>>>>>>", resp);
              if (resp.status === 200 && typeof resp.data === "object") {
                const text = JSON.stringify(resp.data);

                // TODO remove log
                console.log("DID: QRCode Text:", text);

                didChainAuthor.setAuthState(resp.data);

                didChainAuthor.setLeftTime(MaxPeriod);
                showQRMask(false);

                window.didChainAuthor.createQrcode(text, qrsize);
                const b = createQRTimer();
                if (b) {
                  createCheckTimer();
                }
              } else {
                console.warn("API: /api/auth response data fail", data);
              }
            })
            .catch((err) => {
              console.warn(">>>>>>>>Error>>>>>>>>>>>>", err);
              alert(err.message);
            });
        }
      },
      function (erpcError) {
        console.error("Top Page fail.", erpcError.message);
        alert("Top fetch host fail,", erpcError.message);
      }
    );
  }

  function createQRTimer() {
    if (QRTimer !== null) {
      clearInterval(QRTimer) && (QRTimer = null);
      didChainAuthor.setLeftTime(MaxPeriod);
    }
    QRTimer = setInterval(function () {
      const curTimes = didChainAuthor.getLeftTime();
      // console.log("QRTimer >>>>>", curTimes);
      if (curTimes <= 0) {
        // clear
        clearInterval(QRTimer) &&
          (QRTimer = null) &&
          didChainAuthor.setLeftTime(0);

        showQRMask(true);
      } else {
        didChainAuthor.setLeftTime(curTimes - 1);
      }
    }, 1000);

    return QRTimer !== null;
  }

  function createCheckTimer() {
    if (CheckTimer !== null) {
      clearInterval(CheckTimer) && (CheckTimer = null);
    }

    CheckTimer = setInterval(function () {
      const curTimes = didChainAuthor.getLeftTime();

      // console.log("CheckTimer excuting :", curTimes);

      const paramState = didChainAuthor.getAuthState();
      if (curTimes <= 0) {
        console.log("Qrcode expired clear Checker.");
        clearInterval(CheckTimer) && (CheckTimer = null);
      } else if (!!paramState) {
        $http
          .post("/check", paramState)
          .then((resp) => {
            if (resp.status === 200 && typeof resp.data === "object") {
              const resultCode = resp.data.result_code;

              console.log("Check resp:", resultCode, resp);
              if (resultCode === 0) {
                // TODO notify system
                destoryTimers();

                rpc.echo(JSON.stringify(resp.data));
                // demoRedirect();
              } else {
              }
            } else {
              console.log("Check resp illegal.");
            }
          })
          .catch((err) => {
            console.log("Checker- api/check fail.", err.message);
          });
      }
    }, CheckPeriod);

    console.log("CheckTimer Created", CheckTimer);

    return CheckTimer;
  }

  function destoryTimers() {
    didChainAuthor.clearPassedData();
    didChainAuthor.setLeftTime(0);
    if (QRTimer !== null) {
      window.clearInterval(QRTimer) && (QRTimer = null);
    }

    if (CheckTimer !== null) {
      window.clearInterval(CheckTimer) && (CheckTimer = null);
    }
  }

  function fillLeftTimeText(num) {
    $("#DidLeftTimes").text(num);
  }

  function createCanvas(_$container) {
    const canvasHtml =
      '<canvas id="' + CanvasId + '" class="didqrcode-wrap"></canvas>';

    const _$canvas = $(canvasHtml);
    _$container.empty().append(_$canvas);

    return _$canvas;
  }

  function showQRMask(hide) {
    // console.log("<<<.>>", hide);
    !hide
      ? $("#DidQrMask").addClass("mask-hide").removeClass("did-hover")
      : $("#DidQrMask").removeClass("mask-hide").addClass("did-hover");
  }
})({});
