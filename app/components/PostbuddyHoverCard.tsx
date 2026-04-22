"use client";

import { motion } from "motion/react";

export function PostbuddyHoverCard({
  href,
  onMouseEnter,
  onMouseLeave,
}: {
  href: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -4, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="pointer-events-auto absolute top-0 bottom-0 left-full z-50 ml-[24px]"
      style={{ width: 200 }}
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
          preload="metadata"
          className="h-full w-full object-cover object-top"
        />
      </div>
      <div className="absolute top-[17px] left-[20px] right-[20px] text-[#111]">
        <h3 className="text-[14px] font-medium leading-tight">
          Carrying alone
        </h3>
        <p className="mt-[1px] text-[11px] leading-snug text-[rgba(17,17,17,0.5)]">
          <a href={href} className="hover:text-[#111]">
            Read my reflections
          </a>
          .
        </p>
      </div>
    </motion.div>
  );
}
