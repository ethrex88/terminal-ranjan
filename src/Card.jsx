import React, { useRef, useState } from 'react';
import photo from './assets/photo.jpg'; // replace with your asset path

export default function Card() {
  const ref = useRef();
  const [isHovering, setIsHovering] = useState(false);

  function handleMove(e) {
    if (!ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    
    // Calculate position relative to card center
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Calculate rotation angles (more pronounced effect)
    const rotateY = (x / rect.width) * 30; // max 30 degrees
    const rotateX = -(y / rect.height) * 30; // max 30 degrees
    
    // Calculate shine position
    const shineX = ((e.clientX - rect.left) / rect.width) * 100;
    const shineY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Apply 3D transform
    el.style.transform = `
      perspective(1200px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      scale3d(1.05, 1.05, 1.05)
      translateZ(20px)
    `;
    
    // Apply shine effect
    el.style.setProperty('--shine-x', `${shineX}%`);
    el.style.setProperty('--shine-y', `${shineY}%`);
  }

  function handleLeave() {
    if (!ref.current) return;
    ref.current.style.transform = `
      perspective(1200px) 
      rotateX(0deg) 
      rotateY(0deg) 
      scale3d(1, 1, 1)
      translateZ(0px)
    `;
    setIsHovering(false);
  }

  function handleEnter() {
    setIsHovering(true);
  }

  return (
    <div className="card-outer">
      <div
        className={`card ${isHovering ? 'card-hovering' : ''}`}
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onMouseEnter={handleEnter}
      >
        <div className="lanyard" />
        <div className="card-shine" />
        <img src={photo} alt="profile" className="card-photo" />
        <div className="badge-logo">GM</div>
      </div>
    </div>
  );
}
