import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#171514] flex flex-col items-center justify-center gap-4 text-center px-6">
      <h1
        className="text-[#F3EEE4] text-5xl"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        404
      </h1>
      <p className="text-[#A89F91]">This page doesn't exist.</p>
      <Link to="/" className="text-[#C6A15B] underline">
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;