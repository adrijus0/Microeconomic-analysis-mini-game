/*
 * assets.js — key → file resolution and the "missing art" fallback.
 *
 * Code refers to asset KEYS from docs/config.js, never to paths. If a key is
 * not registered or its file fails to load, a labelled coloured box is drawn,
 * a single console.warn is logged, and the game continues. A missing sprite
 * must never produce a blank screen or a thrown error.
 */
(function (root) {
  "use strict";

  var warned = Object.create(null);

  function config() {
    return (root.CONFIG && root.CONFIG.assets) || {};
  }

  function entry(key) {
    var assets = config();
    return assets[key] || null;
  }

  function path(key) {
    var e = entry(key);
    if (!e) return null;
    if (e.file) return e.file;
    var kind = e.kind || "sprite";
    var folder =
      kind === "card" ? "cards" : kind === "background" ? "backgrounds" : "sprites";
    return "assets/" + folder + "/" + key + ".png";
  }

  function warn(key, detail) {
    if (warned[key]) return;
    warned[key] = true;
    console.warn("[assets] missing: " + key + (detail ? " (" + detail + ")" : ""));
  }

  function placeholder(key, e, extraClass) {
    var box = document.createElement("div");
    box.className =
      "asset-fallback asset-fallback--" + ((e && e.kind) || "sprite") +
      (extraClass ? " " + extraClass : "");
    box.setAttribute("role", "img");
    box.setAttribute(
      "aria-label",
      (e && e.alt ? e.alt : "Missing art") + " (missing asset: " + key + ")"
    );
    box.title = "Missing asset: " + key;
    var label = document.createElement("span");
    label.className = "asset-fallback__label";
    label.textContent =
      key.indexOf("allais_") === 0 ? key.slice("allais_".length) : key;
    box.appendChild(label);
    return box;
  }

  function img(key, options) {
    options = options || {};
    var e = entry(key);
    var src = path(key);
    if (!e || !src) {
      warn(key, "not registered in config.js");
      return placeholder(key, e, options.className);
    }

    var image = document.createElement("img");
    image.className = "asset-img " + (options.className || "");
    image.alt =
      options.alt != null ? String(options.alt) : String(e.alt || "");
    if (e.w) image.width = e.w;
    if (e.h) image.height = e.h;
    image.decoding = "async";
    if (options.loading) image.loading = options.loading;

    image.addEventListener("error", function () {
      warn(key, src);
      var fallback = placeholder(key, e, options.className);
      if (image.parentNode) image.parentNode.replaceChild(fallback, image);
    });
    image.src = src;
    return image;
  }

  function markMissingBackground(host, key) {
    host.classList.add("scene-bg--missing");
    /* The background sits behind the scene veil, so its fallback label must
       live outside that stacking context to stay readable. */
    if (document.querySelector('.asset-warning[data-key="' + key + '"]')) return;
    var label = document.createElement("div");
    label.className = "asset-warning";
    label.setAttribute("data-key", key);
    label.setAttribute("role", "status");
    label.textContent = "Missing background: " + key;
    document.body.appendChild(label);
  }

  function background(host, key) {
    if (!host) return;
    host.innerHTML = "";
    var e = entry(key);
    var src = path(key);
    if (!e || !src) {
      warn(key, "not registered in config.js");
      markMissingBackground(host, key);
      return;
    }
    var image = document.createElement("img");
    image.className = "scene-bg__img";
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.decoding = "async";
    image.addEventListener("error", function () {
      warn(key, src);
      image.remove();
      markMissingBackground(host, key);
    });
    image.src = src;
    host.appendChild(image);
  }

  root.GameAssets = {
    entry: entry,
    path: path,
    img: img,
    background: background,
    placeholder: placeholder
  };
})(typeof window !== "undefined" ? window : globalThis);
