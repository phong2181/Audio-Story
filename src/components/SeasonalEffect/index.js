import React, { memo, useMemo } from "react";
import "./style.scss";
import { useGetPublicHeaderSettings } from "api/homePage/queries";

/**
 * Hiệu ứng hạt rơi động theo mùa / lễ tết (Spring/Tet, Summer, Autumn, Winter/Christmas).
 * Hoạt động mượt mà 60fps bằng CSS keyframes thuần túy, an toàn hiệu năng.
 */
const SeasonalEffect = () => {
  const { data: settingsRes } = useGetPublicHeaderSettings();
  const settings = settingsRes?.data;

  const isEnabled = settings?.enable_particles !== false;
  const season = settings?.effective_season || "spring_tet";
  const intensity = settings?.particle_intensity || "medium";

  // Số lượng hạt theo cường độ
  const particleCount = useMemo(() => {
    switch (intensity) {
      case "low":
        return 12;
      case "high":
        return 32;
      case "medium":
      default:
        return 20;
    }
  }, [intensity]);

  // Ký tự hoặc biểu tượng hạt rơi theo từng mùa
  const particleSymbols = useMemo(() => {
    switch (season) {
      case "spring_tet":
        return ["🌸", "💮", "🌺", "✨", "🧧"];
      case "summer":
        return ["☀️", "✨", "🌊", "🫧", "🌴"];
      case "autumn":
        return ["🍂", "🍁", "🌾", "🌕", "✨"];
      case "winter_xmas":
        return ["❄️", "❅", "❆", "✨", "🔔"];
      default:
        return [];
    }
  }, [season]);

  // Tạo mảng hạt với vị trí ngẫu nhiên cố định
  const particles = useMemo(() => {
    if (!isEnabled || season === "default" || particleSymbols.length === 0) {
      return [];
    }

    return Array.from({ length: particleCount }, (_, i) => {
      const left = Math.floor(Math.random() * 98) + 1; // 1% - 99%
      const duration = 7 + Math.random() * 8; // 7s - 15s
      const delay = Math.random() * 8; // 0s - 8s
      const size = 12 + Math.random() * 14; // 12px - 26px
      const symbol = particleSymbols[i % particleSymbols.length];
      const opacity = 0.55 + Math.random() * 0.45;
      const sway = 30 + Math.random() * 60; // Độ lắc lư ngang

      return {
        id: i,
        symbol,
        left: `${left}%`,
        animationDuration: `${duration.toFixed(2)}s`,
        animationDelay: `-${delay.toFixed(2)}s`,
        fontSize: `${size.toFixed(0)}px`,
        opacity,
        sway: `${sway.toFixed(0)}px`,
      };
    });
  }, [isEnabled, season, particleCount, particleSymbols]);

  if (!isEnabled || season === "default" || particles.length === 0) {
    return null;
  }

  return (
    <div className={`seasonal-effect-canvas season-${season}`} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="seasonal-particle"
          style={{
            left: p.left,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            fontSize: p.fontSize,
            opacity: p.opacity,
            "--sway": p.sway,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
};

export default memo(SeasonalEffect);
