/**
 * Valydar Document Capture Widget v0.1.0
 *
 * Browser-based camera capture for documents and selfies.
 * Uses getUserMedia() — requires HTTPS or localhost.
 *
 * Usage:
 *   const capture = new ValydarCapture('#container', { type: 'document' });
 *   const blob = await capture.start();
 *   // blob is a JPEG Blob ready for upload
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ValydarCapture = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function ValydarCapture(containerEl, opts) {
    opts = opts || {};
    this._container = typeof containerEl === "string"
      ? document.querySelector(containerEl)
      : containerEl;
    if (!this._container) throw new Error("ValydarCapture: container not found");
    this._type = opts.type || "document"; // "document" | "selfie"
    this._width = opts.width || 1280;
    this._height = opts.height || 720;
    this._stream = null;
  }

  ValydarCapture.prototype._render = function () {
    var self = this;
    var container = this._container;
    container.innerHTML = "";
    container.style.position = "relative";
    container.style.overflow = "hidden";
    container.style.background = "#000";
    container.style.borderRadius = "12px";

    var video = document.createElement("video");
    video.setAttribute("autoplay", "");
    video.setAttribute("playsinline", "");
    video.style.width = "100%";
    video.style.height = "auto";
    video.style.display = "block";
    video.style.maxWidth = "100%";
    this._video = video;
    container.appendChild(video);

    var overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.pointerEvents = "none";
    container.appendChild(overlay);

    var frame = document.createElement("div");
    frame.style.position = "absolute";
    var fr = this._type === "selfie" ? 0.5 : 0.7;
    frame.style.width = (fr * 100) + "%";
    frame.style.top = ((1 - fr) / 2 * 100) + "%";
    frame.style.left = ((1 - fr) / 2 * 100) + "%";
    frame.style.height = (fr * 0.7 * 100) + "%";
    frame.style.border = "2px solid rgba(99,102,241,0.8)";
    frame.style.borderRadius = this._type === "selfie" ? "50%" : "8px";
    frame.style.boxSizing = "border-box";
    this._frame = frame;
    overlay.appendChild(frame);

    var hint = document.createElement("div");
    hint.textContent = this._type === "selfie"
      ? "Position your face within the oval"
      : "Align document within the frame";
    hint.style.position = "absolute";
    hint.style.bottom = "80px";
    hint.style.left = "0";
    hint.style.right = "0";
    hint.style.textAlign = "center";
    hint.style.color = "#fff";
    hint.style.fontSize = "14px";
    hint.style.fontWeight = "500";
    hint.style.textShadow = "0 1px 4px rgba(0,0,0,0.6)";
    overlay.appendChild(hint);

    var btn = document.createElement("button");
    btn.textContent = "";
    btn.style.position = "absolute";
    btn.style.bottom = "16px";
    btn.style.left = "50%";
    btn.style.marginLeft = "-32px";
    btn.style.width = "64px";
    btn.style.height = "64px";
    btn.style.borderRadius = "50%";
    btn.style.border = "4px solid #fff";
    btn.style.background = "rgba(255,255,255,0.3)";
    btn.style.cursor = "pointer";
    btn.style.zIndex = "10";
    btn.style.pointerEvents = "auto";
    btn.addEventListener("click", function () { self._capture(); });
    overlay.appendChild(btn);

    var inner = document.createElement("div");
    inner.style.width = "52px";
    inner.style.height = "52px";
    inner.style.borderRadius = "50%";
    inner.style.background = "#fff";
    inner.style.margin = "2px auto 0";
    btn.appendChild(inner);
    this._btn = btn;
  };

  ValydarCapture.prototype.start = function () {
    var self = this;
    this._render();
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: this._width, height: this._height }
    }).then(function (stream) {
      self._stream = stream;
      self._video.srcObject = stream;
      return new Promise(function (resolve, reject) {
        self._resolve = resolve;
        self._reject = reject;
      });
    }).then(function (result) {
      self._stop();
      return result;
    }).catch(function (err) {
      self._stop();
      throw err;
    });
  };

  ValydarCapture.prototype._capture = function () {
    var video = this._video;
    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(function (blob) {
      if (this._resolve) this._resolve(blob);
    }.bind(this), "image/jpeg", 0.92);
  };

  ValydarCapture.prototype._stop = function () {
    if (this._stream) {
      this._stream.getTracks().forEach(function (t) { t.stop(); });
      this._stream = null;
    }
  };

  ValydarCapture.prototype.stop = function () {
    if (this._reject) this._reject(new Error("User stopped capture"));
    this._stop();
  };

  return ValydarCapture;
});
