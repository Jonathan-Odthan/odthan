(function () {
  var scriptTag = document.currentScript;
  var site = (scriptTag && scriptTag.getAttribute("data-site")) || "www";

  function send() {
    var payload = JSON.stringify({
      site: site,
      path: location.pathname + location.search,
      referrer: document.referrer || null,
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/public/track", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/public/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true });
      }
    } catch (e) {
      // Un traceur qui echoue ne doit jamais casser la page pour le visiteur.
    }
  }

  if (document.readyState === "complete") send();
  else window.addEventListener("load", send);
})();
