(function () {
  const files = ["/time-log/state.js", "/time-log/genius.js", "/time-log/ui.js"];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Could not load " + src));
      document.head.appendChild(script);
    });
  }

  files.reduce((chain, src) => chain.then(() => loadScript(src)), Promise.resolve()).catch(error => {
    const status = document.getElementById("saveStatus");
    if (status) {
      status.classList.add("error");
      status.innerHTML = '<span class="save-dot"></span>Load error';
    }
    console.error(error);
  });
})();
