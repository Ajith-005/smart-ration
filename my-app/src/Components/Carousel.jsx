import { useState, useEffect, useCallback } from "react";
import "./Carousel.css";

export default function Carousel({ items = [], interval = 5000 }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prev = useCallback(() =>
    setCurrent(c => (c - 1 + items.length) % items.length), [items.length]);

  const next = useCallback(() =>
    setCurrent(c => (c + 1) % items.length), [items.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [next, interval, paused]);

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {items.map((item, i) => (
          <div key={i} className="carousel-slide" style={{ backgroundImage: `url(${item.image})` }}>
            <div className="carousel-overlay" />
            <div className="carousel-content">
              {item.tag && <span className="carousel-tag">{item.tag}</span>}
              <h2 className="carousel-title">{item.title}</h2>
              <p className="carousel-desc">{item.desc}</p>
              {item.cta && (
                <a href={item.ctaHref || "#"} className="carousel-cta">{item.cta}</a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows */}
      <button className="carousel-arrow left" onClick={prev} aria-label="Previous slide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="carousel-arrow right" onClick={next} aria-label="Next slide">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Dots */}
      <div className="carousel-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot${i === current ? " active" : ""}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {/* <div className="carousel-progress">
        <div
          key={current}
          className="carousel-progress-bar"
          style={{ animationDuration: `${interval}ms` }}
        />
      </div> */}
    </div>
  );
}