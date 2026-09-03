"use client";

import { motion, type Variants } from "framer-motion";
import HabitTrackerWidget from "@/components/HabitTrackerWidget";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export default function RoutinesView() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full pb-32 lg:pb-16"
    >
      <HabitTrackerWidget />
    </motion.div>
  );
}
