"use client";

import Script from "next/script";
import { motion } from "framer-motion";

export default function LinkedInBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl"
    >
      {/* LinkedIn badge — constrained inside parent */}
      <div
        className="badge-base LI-profile-badge"
        data-locale="en_US"
        data-size="medium"
        data-theme="dark"
        data-type="HORIZONTAL"
        data-vanity="more-aditya"
        data-version="v1"

      >
        <a
          className="badge-base__link LI-simple-link"
          href="https://www.linkedin.com/in/more-aditya?trk=profile-badge"
          target="_blank"
          rel="noopener noreferrer"
        >
          Aditya More
        </a>
      </div>
      <Script
        src="https://platform.linkedin.com/badges/js/profile.js"
        strategy="lazyOnload"
      />
    </motion.div>
  );
}
