(function () {
  try {
    if (window.localStorage.getItem("hy-realtors:theme") === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#1E1D2F");
    }
  } catch (e) {}
})();
