(function ($, QRCode) {
  if (!$) throw new Error("need Jquery lib.");
  if (!QRCode) throw new Error("need qrcode lib.");

  initialHttp();

  /* --------------- Inner Scope Constant Defined Begin ----------------  */

  const DEV_MODE = true;
  const DEF_MAX_EXPIRED_PERIOD = 10; // second
  const DEF_SIZE = {
    w: 200,
    h: 220,
    qrw: 80,
  };
  const CHECKED_PERIOD = 2500; // 检查API 周期

  const QR_MIN_SIZE = 80; // QRCode 最小高度
  /**
   * time line-height 20 +
   * refresh button line-height 20 + padding 4 +1 = 30
   */
  const DEF_ADJUST_DIFF = 52; //
  const CanvasId = "__EidQrcodeContainer";

  /**
   * EJRPC API
   */
  const EJRPC_FETCH_INIT_API = {
    erpcMethod: "fetchHostname",
  };

  const EJRPC_FETCH_INIT_API_V1 = {
    erpcMethod: "fetchInitConfig_v1",
  };

  const BaseQROptions = {
    version: 13,
    errorCorrectionLevel: "M",
    margin: 1,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  };
  /*---------------- Inner Scope Constant Defined End ----------------- */
  let QRTimer = null;
  let CheckTimer = null;

  // Eid JRPC Protocol begin
  window.rpc = new easyXDM.Rpc(
    {
      isHost: false,
      protocol: "1",
    },
    {
      remote: {
        echo: {},
        eidHandProtocol: {},
      },
    }
  );

  /** Modal */
  const Modal = function () {
    this.config = {
      expiredPeriod: DEF_MAX_EXPIRED_PERIOD,
    };

    this.passedData = null;
    this.leftTimes = DEF_MAX_EXPIRED_PERIOD;

    this.size = Object.assign({}, DEF_SIZE);
    this.qrw = DEF_SIZE.qrw;

    this.hostname = "";
    this.setHostname = function (hostname) {
      this.hostname = hostname;
    };
    /**
     * {auth_url,random_token}
     */
    this.authState = null;

    this.getAuthState = function () {
      return this.authState;
    };
    this.setAuthState = function (authState) {
      this.authState = authState;
    };

    this.getPassedData = function () {
      return this.passedData;
    };
    this.setPassedData = function (passedData) {
      this.passedData = passedData;
    };
    this.clearPassedData = function () {
      this.passedData = null;
    };

    this.setQRCodeSize = function (qrw) {
      if (qrw < QR_MIN_SIZE) {
        console.warn(
          "Top sizeHandProtocol size[" +
            qrw +
            "] < Min_Size, used default[" +
            QR_MIN_SIZE +
            "]."
        );
      } else {
        this.qrw = qrw;
      }
    };

    this.getQRCodeOptions = function () {
      const qrWidth = this.qrw;
      return Object.assign({}, BaseQROptions, { width: qrWidth });
    };
  };

  Modal.EXPIRED_PERIOD = DEF_MAX_EXPIRED_PERIOD;

  Modal.prototype.setLeftTime = function (num) {
    if (num <= 0) {
      this.leftTimes = 0;
    } else {
      this.leftTimes = num;
    }
    fillLeftTimeText(this.leftTimes || 0);
  };

  Modal.prototype.getLeftTime = function () {
    return this.leftTimes < 0 ? 0 : this.leftTimes;
  };

  Modal.prototype.resetLeftTime = function () {
    const initTimes = this.config["expiredPeriod"] || EXPIRED_PERIOD;
    this.leftTimes = initTimes;
    fillLeftTimeText(initTimes);
  };

  Modal.prototype.setConfigProps = function (key, val) {
    this.config[key] = val;
  };

  window.eidInst = new Modal();

  // bind btn event
  bindRefreshBtn();
  bindMaskRefreshBtn();

  // init main
  fetchSizeMessage();

  // createQrcode("jjsjdfjsdhfjsjdfkaasdfasdfjkasdfkjasdf");

  /* **************  Inner functions begin ****************************** */
  function fetchSizeMessage() {
    rpc.eidHandProtocol(
      EJRPC_FETCH_INIT_API_V1,
      function (erpcResponse) {
        Log("eidHandProtocol :", erpcResponse);
        if (erpcResponse && erpcResponse.data && erpcResponse.data.hostname) {
          const hostname = erpcResponse.data.hostname;
          eidInst.setHostname(hostname);
          let qrWidth = erpcResponse.data.qrw || modal.qrw;
          eidInst.setQRCodeSize(qrWidth);

          if (erpcResponse.data.expiredPeriod > 0)
            eidInst.setConfigProps(
              "expiredPeriod",
              erpcResponse.data.expiredPeriod
            );

          //
          generateQRCode(hostname, qrWidth);
        } else {
          throw new Error(
            "Init EJRPC fail,maybe miss response data.",
            erpcResponse
          );
        }
        // const hostname =
      },
      function (erpcError) {
        console.warn("EJRPC fail", erpcError);
        throw new Error("Init EJRPC fail.", erpcError.message);
      }
    );
  }

  function generateQRCode(hostname, qrWidth) {
    if (typeof hostname !== "string" || !hostname.trim().length) {
      throw new Error("hostname lost.");
    }

    $http
      .get("auth?hostname=" + hostname)
      .then((resp) => {
        if (resp.status === 200 && typeof resp.data === "object") {
          const text = JSON.stringify(resp.data);
          eidInst.setAuthState(resp.data);
          Log(">>>>>>>>axios>>>>>>>>>>>>", text);
          const container = getQRCodeContainer();
          const _canvas = createCanvas(container);

          const _qrOpts = eidInst.getQRCodeOptions();

          QRCode.toCanvas(_canvas[0], text, _qrOpts, function (err) {
            if (err) {
              console.warn("create QRCode fail.", err.message);
            } else {
              Log("Create QRcode success.", text);
              eidInst.resetLeftTime();
              createQRTimer() && createCheckTimer();
            }
          });
        }
      })
      .catch((err) => {
        console.warn("Call EID Chain API [/auth] fail.", err.message);
      });
  }

  function createCanvas(_$container) {
    const canvasHtml =
      '<canvas id="' + CanvasId + '" class="eid-qrcode-canvas"></canvas>';

    const _$canvas = $(canvasHtml);
    _$container.empty().append(_$canvas);

    return _$canvas;
  }

  function getQRCodeContainer() {
    return $("#__DidQrcodeContainer");
  }

  function bindRefreshBtn() {
    $("#DidRefreshBtn").on("click", function (e) {
      fetchSizeMessage();
    });
  }

  function bindMaskRefreshBtn() {
    $("#DidMaskTipBtn").on("click", function (e) {
      fetchSizeMessage();
    });
  }

  /** Timer */
  function createQRTimer() {
    if (QRTimer !== null) {
      clearInterval(QRTimer) && (QRTimer = null);
    }

    showQRMask(false);
    QRTimer = setInterval(function () {
      const curTimes = eidInst.getLeftTime();
      if (curTimes <= 0) {
        // clear
        clearInterval(QRTimer) && (QRTimer = null);
        eidInst.setLeftTime(0);
        eidInst.setAuthState(null);

        showQRMask(true);
      } else {
        eidInst.setLeftTime(curTimes - 1);
      }
    }, 1000);

    return QRTimer !== null;
  }

  function createCheckTimer() {
    if (CheckTimer !== null) {
      clearInterval(CheckTimer) && (CheckTimer = null);
    }

    CheckTimer = setInterval(function () {
      const curTimes = eidInst.getLeftTime();

      const paramState = eidInst.getAuthState();
      console.log(">>>>>>>>>>>>paramState>>>>>>", paramState);
      if (curTimes <= 0) {
        Log("Qrcode expired clear Checker.");
        clearInterval(CheckTimer) && (CheckTimer = null);
      } else if (!!paramState) {
        $http
          .post("/check", paramState)
          .then((resp) => {
            console.log(">>>>>>>>>>>>>>>>>>", resp);
            if (resp.status === 200 && typeof resp.data === "object") {
              const resultCode = resp.data.result_code;

              Log("Check resp:", resultCode, resp);
              if (resultCode === 0) {
                //  notify system
                destoryTimers();

                console.log(">>>>>>>>>>>>>>>>>>", resp.data);
                rpc.echo(JSON.stringify(resp.data));
                // demoRedirect();
              } else {
              }
            } else {
              console.warn("Check resp illegal.");
            }
          })
          .catch((err) => {
            console.log("Checker- api/check fail.", err.message);
          });
      }
    }, CHECKED_PERIOD);

    console.log("CheckTimer Created", CheckTimer);

    return CheckTimer;
  }

  function destoryTimers() {
    eidInst.clearPassedData();
    eidInst.setLeftTime(0);
    if (QRTimer !== null) {
      window.clearInterval(QRTimer) && (QRTimer = null);
    }

    if (CheckTimer !== null) {
      window.clearInterval(CheckTimer) && (CheckTimer = null);
    }
  }

  /**
   *
   */
  function initialHttp() {
    if (!axios) {
      throw new Error("unfound axios lib.");
    } else {
      const BASE_API_URL = "/api/"; // don't modified this match the nginx config
      // axios.interceptors.request.use((config) => {
      //   config.withCredentials = true;
      //   return config;
      // });

      const $http = axios.create({
        baseURL: BASE_API_URL,
        timeout: 60000,
        headers: { "Access-Control-Allow-Origin": "*" },
      });

      $http.interceptors.request.use((config) => {
        config.withCredentials = true;
        return config;
      });
      window.$http = $http;
    }
  }

  function fillLeftTimeText(text) {
    $("#DidLeftTimes").text(text);
  }

  function showQRMask(hide) {
    // console.log("<<<.>>", hide);
    !hide
      ? $("#DidQrMask").addClass("mask-hide")
      : $("#DidQrMask").removeClass("mask-hide");
  }

  function Log(...args) {
    DEV_MODE && console.log(...args);
  }
})(jQuery, QRCode);
