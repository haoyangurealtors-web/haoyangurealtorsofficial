import React, { useEffect, useRef, useState } from "react";
import { createHouseScene } from "./authHouseScene.js";

/*
  The small 3D house at the top of the log-in / sign-up window. The drawing itself lives in
  authHouseScene.js; this file only connects it to the page.

  - It loads on its own (App.jsx imports it with React.lazy), so it never slows the first page load.
  - It is only decoration (hidden from screen readers). If the device has no WebGL, or the
    graphics context is lost, it quietly disappears and the form carries on as normal.
  - It pauses when the window is closed or the tab is hidden, and holds still if the person asked
    their device for reduced motion.
  - While someone types in the form, the house "wakes up": the windows glow brighter and the
    camera leans in a little.
*/

export default function AuthHouse3D({ active = true }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const reducedQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
    let scene = null;
    try {
      scene = createHouseScene(canvas, wrap, {
        getTheme: () => {
          const root = wrap.closest("[data-theme]");
          return root && root.getAttribute("data-theme") === "dark" ? "dark" : "light";
        },
        reducedMotion: () => reducedQuery.matches,
        onLost: () => setSupported(false),
      });
    } catch (e) {
      scene = null;
    }
    if (!scene) {
      setSupported(false);
      return undefined;
    }
    sceneRef.current = scene;
    scene.setActive(activeRef.current);

    // Typing in any field wakes the house up.
    const dialog = wrap.closest(".pk-modal");
    const isField = (el) => Boolean(el && el.matches && el.matches("input, textarea, select"));
    const onIn = (e) => {
      if (isField(e.target)) scene.setExcited(true);
    };
    const onOut = (e) => {
      if (!isField(e.relatedTarget)) scene.setExcited(false);
    };
    if (dialog) {
      dialog.addEventListener("focusin", onIn);
      dialog.addEventListener("focusout", onOut);
    }

    return () => {
      sceneRef.current = null;
      if (dialog) {
        dialog.removeEventListener("focusin", onIn);
        dialog.removeEventListener("focusout", onOut);
      }
      scene.dispose();
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) sceneRef.current.setActive(active);
  }, [active]);

  if (!supported) return null;
  return (
    <div ref={wrapRef} className="pk-auth-3d" aria-hidden="true">
      <canvas ref={canvasRef} className="pk-auth-3d-canvas" />
    </div>
  );
}
