const FOOD_IMAGES = [
  { src: "/images/floating/food-1.png", top: "15%", left: "50%", size: 200, duration: "7s", delay: "0s" },
  { src: "/images/floating/food-2.png", top: "13%", left: "74%", size: 200, duration: "8.5s", delay: "1.5s" },
  { src: "/images/floating/food-3.png", top: "40%", left: "58%", size: 200, duration: "9s", delay: "0.6s" },
  { src: "/images/floating/food-4.png", top: "40%", left: "80%", size: 220, duration: "7.5s", delay: "2s" },
  { src: "/images/floating/food-5.png", top: "68%", left: "55%", size: 240, duration: "6.5s", delay: "1s" },
  { src: "/images/floating/food-6.png", top: "68%", left: "78%", size: 230, duration: "10s", delay: "1.8s" },
];

function FloatingFoodImages() {
  return (
    <div className="absolute inset-0 pointer-events-none hidden md:block" style={{ zIndex: 5 }}>
      {FOOD_IMAGES.map((item, idx) => (
        <img
          key={idx}
          src={item.src}
          alt=""
          className="absolute object-contain animate-float-drift drop-shadow-2xl"
          style={{
            top: item.top,
            left: item.left,
            width: item.size,
            height: item.size,
            animationDuration: item.duration,
            animationDelay: item.delay,
          }}
        />
      ))}
    </div>
  );
}

export default FloatingFoodImages;