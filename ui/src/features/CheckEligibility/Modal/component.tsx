// src/App.js
import React, { useReducer, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const Modal1 = ({ isOpen, onClose, isEligible }) => {
  const containerVariants = {
    hidden: {
      opacity: 0,
      rotate: 40,
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      rotate: [40, -10, 5, -2, 0],
      scale: [0.5, 1.1, 0.9, 1.03, 1],
      transition: {
        duration: 1,
        type: 'spring',
        stiffness: 1000,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      rotate: 40,
      scale: 0.5,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 500,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const getModalContent = () => {
    if (isEligible) {
      return {
        gradientFrom: 'from-green-200',
        iconBg: 'bg-green-100',
        iconBorder: 'border-teal-600',
        iconColor: 'text-teal-600',
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        ),
        title: 'Happy Coronation Day',
        message:
          'Claim your tokens below and begin your journey into the realms of intersubjectivity.',
        primaryButtonBg: 'bg-teal-700 hover:bg-teal-600',
        primaryButtonText: 'Claim Airdrop',
      };
    } else {
      return {
        gradientFrom: 'from-red-200',
        iconBg: 'bg-red-100',
        iconBorder: 'border-red-600',
        iconColor: 'text-red-600',
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        ),
        title: 'Sorry!',
        message:
          'Some call-to-action to stay posted, informing users about Tribbles on DEXs',
        primaryButtonBg: 'bg-red-700 hover:bg-red-600',
        primaryButtonText: 'Check a different wallet',
      };
    }
  };

  const content = getModalContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
          >
            <div className="w-96 rounded-lg bg-white p-0 md:w-[32rem]">
              <div
                className={`h-24 w-full bg-gradient-to-b ${content.gradientFrom} rounded-lg to-transparent`}
              ></div>
              <div className="flex justify-center">
                <div className="relative">
                  <div
                    className={`h-16 w-16 ${content.iconBg} mb-20 flex items-center justify-center rounded-full border-4 ${content.iconBorder}`}
                  >
                    <svg
                      className={`h-10 w-10 ${content.iconColor}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {content.icon}
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="pb-2 text-center text-2xl font-bold text-slate-900">
                {content.title}
              </h2>
              <p className="mb-4 px-8 pb-10 text-center text-gray-500">
                {content.message}
              </p>
              <div className="flex flex-col items-center space-y-4 px-4 pb-6">
                <button
                  className={`${content.primaryButtonBg} h-16 w-full rounded-lg px-4 py-2 text-xl font-semibold text-white`}
                  onClick={onClose}
                >
                  {content.primaryButtonText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Modal = ({ status, isEligible, onClose, isOpen }) => (
  <Modal1 isOpen={isOpen} onClose={onClose} isEligible={isEligible} />
);

export default Modal;
