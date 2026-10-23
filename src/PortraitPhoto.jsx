import React from 'react';
// The frame stays still; only the photograph responds to a tap or keyboard press.
export default function PortraitPhoto({ label, ...image }) {
  return <button className="portrait-touch" type="button" aria-label={label}>
    <img {...image} />
  </button>;
}
