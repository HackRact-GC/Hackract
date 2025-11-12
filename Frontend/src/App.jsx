import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let fontSize = 16;
    let columns = Math.floor(window.innerWidth / fontSize);
    let drops = new Array(columns).fill(0);
    const speed = 0.6;
    const alpha = 0.08;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(0);

      // Draw HACKRACT text on a hidden canvas to get pixel positions
      const hiddenCanvas = document.createElement("canvas");
      hiddenCanvas.width = canvas.width;
      hiddenCanvas.height = canvas.height;
      const hCtx = hiddenCanvas.getContext("2d");
      hCtx.font = `${Math.floor(canvas.height / 4)}px monospace`;
      hCtx.fillStyle = "white";
      hCtx.textAlign = "center";
      hCtx.textBaseline = "middle";
      hCtx.fillText("HACKRACT", canvas.width / 2, canvas.height / 2);

      // Get text pixel positions
      const imageData = hCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      window.textPixels = [];
      for (let y = 0; y < canvas.height; y += fontSize) {
        for (let x = 0; x < canvas.width; x += fontSize) {
          const index = (y * canvas.width + x) * 4;
          if (data[index + 3] > 128) {
            window.textPixels.push({ x, y });
          }
        }
      }
    };

    const draw = () => {
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Pick either random 0/1 or a HACKRACT pixel if available
        let text = Math.random() > 0.5 ? "0" : "1";

        // 50% chance to draw a HACKRACT pixel
        if (window.textPixels && Math.random() > 0.5) {
          const pixel = window.textPixels[Math.floor(Math.random() * window.textPixels.length)];
          text = "0"; // You can also randomize 0/1
          ctx.fillStyle = "#00ff88";
          ctx.fillText(text, pixel.x, pixel.y);
        } else {
          const x = i * fontSize;
          const y = drops[i] * fontSize;
          ctx.fillStyle = Math.random() > 0.98 ? "#b3ffd9" : "#00ff88";
          ctx.fillText(text, x, y);
          if (y > canvas.height + Math.random() * 10000) drops[i] = 0;
          drops[i] += speed * (0.5 + Math.random() * 1.5);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="margin-0 relative h-screen w-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
    </div>
  );
}
