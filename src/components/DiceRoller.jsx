// DiceRoller.jsx
import { useState } from "react";
import { motion } from "framer-motion";

export default function DiceRoller({ onRoll }) {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [rolling, setRolling] = useState(false);

  const rollDice = () => {
    setRolling(true);
    const newDice1 = Math.floor(Math.random() * 6) + 1;
    const newDice2 = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setDice1(newDice1);
      setDice2(newDice2);
      setRolling(false);
      onRoll(newDice1 + newDice2);
    }, 1000);
  };

  const diceStyle =
    "w-16 h-16 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center text-2xl font-bold shadow";

  return (
    <div className="flex flex-col items-center mt-6">
      <div className="flex gap-4">
        <motion.div
          animate={{ rotate: rolling ? 360 : 0 }}
          transition={{ duration: 1 }}
          className={diceStyle}
        >
          {dice1}
        </motion.div>
        <motion.div
          animate={{ rotate: rolling ? -360 : 0 }}
          transition={{ duration: 1 }}
          className={diceStyle}
        >
          {dice2}
        </motion.div>
      </div>
      <button
        onClick={rollDice}
        disabled={rolling}
        className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition disabled:opacity-50"
      >
        {rolling ? "Đang tung..." : "🎲 Tung xúc xắc"}
      </button>
    </div>
  );
}
