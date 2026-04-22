"use client";

import { motion } from "motion/react";

export function PostbuddyHoverCard({
  href,
  open,
  onMouseEnter,
  onMouseLeave,
}: {
  href: string;
  open: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4, scale: 0.96 }}
      animate={open ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -4, scale: 0.96 }}
      transition={{ duration: open ? 0.2 : 0.15, ease: "easeOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-0 left-full z-50 ml-[24px]"
      style={{
        width: 200,
        height: 224,
        pointerEvents: open ? "auto" : "none",
        transformOrigin: "left center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/postbuddy-stamp.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.12))" }}
      />
      <div className="absolute bottom-[14px] left-[20px] right-[20px] h-[180px] overflow-hidden">
        <video
          src="/postbuddy-boulder.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover object-top"
        />
      </div>
      <div className="absolute top-[17px] left-[20px] right-[20px] text-[#111]">
        <h3 className="text-[14px] font-medium leading-tight">
          Carrying alone
        </h3>
        <p className="mt-[1px] text-[11px] leading-snug text-[rgba(17,17,17,0.5)]">
          <a href={href} className="no-underline hover:text-[#111]">
            Read my reflections
          </a>
          .
        </p>
      </div>
    </motion.div>
  );
}
