import { useEffect, useRef, useState } from "react";

// Uiverse.io BB8 Toggle as a floating chat droid
export default function BB8ChatDroid({ onClick }: { onClick: () => void }) {
  const [show, setShow] = useState(false);
  const droidRef = useRef<HTMLLabelElement>(null);

  // Sneak in/out animation
  useEffect(() => {
    setShow(true);
    let sneakTimer: NodeJS.Timeout;
    function randomize() {
      // Show up for 8-16s, hide for 4-8s
      const showTime = 8000 + Math.random() * 8000;
      const hideTime = 4000 + Math.random() * 4000;
      setShow(true);
      sneakTimer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          setShow(true);
        }, hideTime);
      }, showTime);
    }
    randomize();
    return () => {
      clearTimeout(sneakTimer);
    };
  }, []);

  // On click, always show and trigger chat
  function handleClick() {
    setShow(true);
    onClick();
  }

  return (
    <label
      className={`bb8-toggle bb8-chat-droid${show ? " show" : " hide"}`}
      title="Talk to R2D2"
      tabIndex={0}
      role="button"
      aria-label="Open AI Assistant Chat"
      style={{ outline: "none", position: "fixed", bottom: 0, right: 32, zIndex: 100 }}
      onClick={handleClick}
      ref={droidRef}
    >
      {/* The droid and scenery, from Uiverse.io HTML structure */}
      <input type="checkbox" className="bb8-toggle__checkbox" tabIndex={-1} readOnly checked={false} />
      <div className="bb8-toggle__container">
        <div className="bb8-toggle__scenery">
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="gomrassen" />
          <div className="hermes" />
          <div className="chenini" />
          <div className="tatto-1" />
          <div className="tatto-2" />
          <div className="bb8-toggle__cloud" />
          <div className="bb8-toggle__cloud" />
          <div className="bb8-toggle__cloud" />
        </div>
        <div className="bb8">
          <div className="bb8__head-container">
            <div className="bb8__antenna" />
            <div className="bb8__antenna" />
            <div className="bb8__head" />
          </div>
          <div className="bb8__body" />
        </div>
        <div className="bb8__shadow" />
      </div>
    </label>
  );
}
