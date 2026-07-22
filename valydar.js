/**
 * Valydar Web SDK v0.1.0
 *
 * Identity verification: document capture, selfie + liveness, face match, AML.
 *
 * Usage:
 *   const sdk = new Valydar({ apiKey: '...', apiUrl: 'https://api.dev.valydar.com' });
 *   const v = await sdk.createVerification({ checks: ['document', 'liveness', 'face_match'] });
 *   const doc = await sdk.uploadDocument(v.id, file, 'passport');
 *   const sfl = await sdk.uploadSelfie(v.id, selfieFile);
 *   const match = await sdk.faceMatch(v.id, doc.id, sfl.selfie_id);
 */
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Valydar = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var POLL_INTERVAL_MS = 2000;
  var MAX_POLL_ATTEMPTS = 150;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function toFormData(data) {
    var form = new FormData();
    for (var key in data) {
      if (data.hasOwnProperty(key) && data[key] != null) {
        form.append(key, data[key]);
      }
    }
    return form;
  }

  function imageToBlob(input) {
    return new Promise(function (resolve, reject) {
      if (input instanceof Blob || input instanceof File) {
        resolve(input);
        return;
      }
      if (typeof input !== "string") {
        reject(new Error("Expected File, Blob, or base64 data URL"));
        return;
      }
      var parts = input.split(",");
      var match = parts[0].match(/:(.*?);/);
      var mime = match ? match[1] : "image/jpeg";
      var b64 = parts[1] || parts[0];
      var raw = atob(b64);
      var arr = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
      resolve(new Blob([arr], { type: mime }));
    });
  }

  // ── SDK ──────────────────────────────────────────────────────────────────────

  function Valydar(config) {
    if (!config || !config.apiKey) throw new Error("Valydar: apiKey is required");
    this.apiKey = config.apiKey;
    this.apiUrl = (config.apiUrl || "").replace(/\/+$/, "");
  }

  Valydar.prototype._fetch = function (method, path, body, json) {
    var headers = { Authorization: "Bearer " + this.apiKey };
    if (json) headers["Content-Type"] = "application/json";
    var opts = { method: method, headers: headers };
    if (body != null) opts.body = body;
    return fetch(this.apiUrl + path, opts).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () {
          return { error: { message: res.statusText } };
        }).then(function (d) {
          throw new Error((d.error && d.error.message) || res.statusText);
        });
      }
      return res.json();
    });
  };

  // ── Verification ─────────────────────────────────────────────────────────────

  Valydar.prototype.createVerification = function (opts) {
    opts = opts || {};
    return this._fetch("POST", "/verifications", JSON.stringify({
      client_reference: opts.clientReference || "sdk-" + Date.now(),
      checks: opts.checks || ["identity", "aml"],
      redirect_url: opts.redirectUrl || null,
    }), true);
  };

  Valydar.prototype.getVerification = function (id) {
    return this._fetch("GET", "/verifications/" + id);
  };

  Valydar.prototype.waitForCompletion = function (id, onProgress) {
    var self = this;
    var attempts = 0;
    return new Promise(function (resolve, reject) {
      function poll() {
        if (++attempts > MAX_POLL_ATTEMPTS) return reject(new Error("Timed out"));
        self.getVerification(id).then(function (data) {
          if (data.status === "completed" || data.status === "failed") resolve(data);
          else { if (onProgress) onProgress(data); setTimeout(poll, POLL_INTERVAL_MS); }
        }).catch(reject);
      }
      poll();
    });
  };

  // ── Document Upload ──────────────────────────────────────────────────────────

  Valydar.prototype.uploadDocument = function (verificationId, image, documentType) {
    var self = this;
    return imageToBlob(image).then(function (blob) {
      return self._fetch("POST", "/verifications/" + verificationId + "/documents",
        toFormData({ document_type: documentType || "passport", file: blob }));
    });
  };

  // ── Selfie Upload ────────────────────────────────────────────────────────────

  Valydar.prototype.uploadSelfie = function (verificationId, image) {
    var self = this;
    return imageToBlob(image).then(function (blob) {
      return self._fetch("POST", "/verifications/" + verificationId + "/selfie",
        toFormData({ file: blob }));
    });
  };

  // ── Face Match ───────────────────────────────────────────────────────────────

  Valydar.prototype.faceMatch = function (verificationId, documentId, selfieId) {
    return this._fetch("POST", "/verifications/" + verificationId + "/face-match",
      JSON.stringify({ document_id: documentId, selfie_id: selfieId }), true);
  };

  // ── Document Liveness ────────────────────────────────────────────────────────

  Valydar.prototype.documentLiveness = function (verificationId, documentId) {
    return this._fetch("POST",
      "/verifications/" + verificationId + "/documents/" + documentId + "/liveness");
  };

  // ── Health ───────────────────────────────────────────────────────────────────

  Valydar.prototype.health = function () {
    return this._fetch("GET", "/health");
  };

  return Valydar;
});
