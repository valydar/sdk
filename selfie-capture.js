/**
 * Valydar Selfie Capture Widget v0.1.0
 *
 * Browser-based selfie capture with face oval guide.
 * Shorthand for new ValydarCapture(el, { type: 'selfie' })
 *
 * Usage:
 *   const capture = new ValydarSelfieCapture('#container');
 *   const blob = await capture.start();
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ValydarSelfieCapture = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function ValydarSelfieCapture(containerEl, opts) {
    opts = opts || {};
    opts.type = "selfie";
    opts.width = 640;
    opts.height = 480;
    var Capture = root.ValydarCapture || require("./document-capture");
    return new Capture(containerEl, opts);
  }

  return ValydarSelfieCapture;
});
