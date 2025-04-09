// components/TopBar.tsx
import React from "react";
import Image from "next/image";

const TopBar: React.FC = () => {
  return (
    <div className="top-bar">
      <a
        href="https://Calculator5329.github.io"
        target="_blank"
        rel="noopener noreferrer"
        className="avatar-link"
      >
        <div className="profile-avatar">
          <Image src="/profile.png" alt="Me" fill />
        </div>
      </a>
      <h1 className="top-title">Portfolio Backtest</h1>
    </div>
  );
};

export default TopBar;
