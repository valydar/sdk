(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ValydarIDV = factory();
  }
})(this, function () {
  'use strict';

  var API_BASE = '/api';

  function IdvWidget(config) {
    this.apiKey = config.apiKey || '';
    this.container = typeof config.container === 'string'
      ? document.querySelector(config.container)
      : config.container;
    this.onComplete = config.onComplete || function () {};
    this.onError = config.onError || function () {};
    this.verificationId = null;
    this.statusPollInterval = null;
  }

  IdvWidget.prototype.start = function (options) {
    options = options || {};
    var checks = options.checks || ['identity', 'aml', 'self_exclusion'];
    var self = this;
    this.renderLoading();

    fetch(API_BASE + '/verifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.apiKey
      },
      body: JSON.stringify({
        client_reference: options.clientReference || 'sdk-' + Date.now(),
        checks: checks
      })
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      self.verificationId = data.id;
      if (data.redirect_url) {
        self.renderRedirect(data.redirect_url);
      } else {
        self.startPolling();
      }
    })
    .catch(function (err) {
      self.renderError(err.message || 'Failed to create verification');
      self.onError(err);
    });
  };

  IdvWidget.prototype.renderLoading = function () {
    this.container.innerHTML =
      '<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif">' +
      '<div style="border:3px solid #e2e8f0;border-top:3px solid #4f6ef7;border-radius:50%;width:32px;height:32px;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div>' +
      '<p style="color:#64748b;font-size:14px">Starting verification...</p>' +
      '<style>@keyframes spin{to{transform:rotate(360deg)}}</style></div>';
  };

  IdvWidget.prototype.renderRedirect = function (url) {
    this.container.innerHTML =
      '<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif">' +
      '<p style="font-size:16px;margin-bottom:20px;color:#1e293b">You will be redirected to your bank to verify your identity.</p>' +
      '<a href="' + url + '" style="display:inline-block;padding:12px 32px;background:#4f6ef7;color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600">Continue with iDIN</a>' +
      '</div>';
  };

  IdvWidget.prototype.startPolling = function () {
    var self = this;
    this.renderLoading();
    this.statusPollInterval = setInterval(function () {
      fetch(API_BASE + '/verifications/' + self.verificationId, {
        headers: { 'Authorization': 'Bearer ' + self.apiKey }
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status === 'completed') {
          clearInterval(self.statusPollInterval);
          self.renderSuccess(data);
          self.onComplete(data);
        } else if (data.status === 'failed') {
          clearInterval(self.statusPollInterval);
          self.renderError('Verification failed');
          self.onError(new Error('Verification failed'));
        } else {
          self.renderProgress(data.checks || {});
        }
      })
      .catch(function () {});
    }, 3000);
  };

  IdvWidget.prototype.renderSuccess = function (data) {
    var checks = data.checks || {};
    var html = '<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif">' +
      '<div style="width:48px;height:48px;border-radius:50%;background:#d1fae5;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>' +
      '<h2 style="margin:0 0 8px;font-size:20px;color:#1e293b">Verification Complete</h2>' +
      '<table style="width:100%;max-width:360px;margin:16px auto;border-collapse:collapse;text-align:left;font-size:13px">';
    Object.keys(checks).forEach(function (key) {
      var check = checks[key];
      var passed = check && check.passed;
      html += '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-transform:capitalize">' + key.replace(/_/g, ' ') +
        '</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right">' +
        (passed ? '<span style="color:#10b981">&#10003;</span>' : '<span style="color:#ef4444">&#10007;</span>') +
        '</td></tr>';
    });
    html += '</table></div>';
    this.container.innerHTML = html;
  };

  IdvWidget.prototype.renderProgress = function () {
    var checks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var completed = Object.keys(checks).filter(function (k) { return checks[k] && checks[k].passed !== undefined; }).length;
    var html = '<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif">' +
      '<div style="border:3px solid #e2e8f0;border-top:3px solid #4f6ef7;border-radius:50%;width:32px;height:32px;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div>' +
      '<p style="color:#64748b;font-size:14px">Processing... (' + completed + ' checks completed)</p>' +
      '<style>@keyframes spin{to{transform:rotate(360deg)}}</style></div>';
    this.container.innerHTML = html;
  };

  IdvWidget.prototype.renderError = function (message) {
    this.container.innerHTML =
      '<div style="text-align:center;padding:40px;font-family:-apple-system,sans-serif">' +
      '<div style="width:48px;height:48px;border-radius:50%;background:#fee2e2;display:flex;align-items:center;justify-content:center;margin:0 auto 16px">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>' +
      '<p style="color:#ef4444;font-size:14px;margin:0">' + message + '</p></div>';
  };

  IdvWidget.prototype.destroy = function () {
    if (this.statusPollInterval) clearInterval(this.statusPollInterval);
    this.container.innerHTML = '';
  };

  return IdvWidget;
});
