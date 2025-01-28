// src/App.js
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAgoric } from '@agoric/react-components';

const generateInt = x => () => Math.floor(Math.random() * (x + 1));

const createTestTier = generateInt(4); // ?
const STRING_CONSTANTS = {
  OFFER_TYPES: {
    AGORIC_CONTRACT: 'agoricContract',
    CONTRACT: 'contract',
  },
  OFFER_NAME: 'makeClaimTokensInvitation',
  INSTANCE: {
    PATH: 'tribblesAirdrop3',
  },
  ISSUERS: {
    TRIBBLES: 'Tribbles3',
    IST: 'IST',
    BLD: 'BLD',
  },
};

const makeGive = ({ keyword = 'Fee', brand, value = 5n }) => ({
  give: { [keyword]: { brand, value } },
});

const Modal = ({ proof, isOpen, onClose, isEligible, publicKey, istBrand }) => {
  const { walletConnection } = useAgoric();

  const [notification, setNotification] = useState({});

  // const tribblesWallet = useAgoric().purses.map(x => <li<b> </b></li>/li>)

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

  useEffect(() => {
    const handleEscapeKey = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup listener when component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);
  const handleRespone = ({ type, payload }) =>
    type === 'error'
      ? setNotification({
          data: payload.data,
          message: payload.text,
          status: 'error',
        })
      : type === 'refunded'
        ? setNotification({
            data: payload.data,
            message: payload.text,
            status: 'refunded',
          })
        : setNotification({
            data: payload.data,
            message: payload.text,
            status: 'success',
          });
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
        nextActionFn: async e => {
          const giveArgs = { brand: istBrand, value: 5n };
          console.log('------------------------');
          console.log('give::', giveArgs);
          const offerArgsValue = {
            key: publicKey,
            tier: createTestTier(),
            proof,
          };
          console.log({
            offerArgsValue,
          });

          console.log('offerArgsValue:::', offerArgsValue); /**
           * invitationSpec,
           * proposal,
           * offerArgs,
           *   id: `offer-${id}`,
  invitationSpec: {
    source: 'contract',
    instance,
    publicInvitationMaker: 'makeClaimTokensInvitation',
  },
  proposal: { give: { Fee: feeAmount } },
           */

          await walletConnection?.makeOffer(
            {
              source: STRING_CONSTANTS.OFFER_TYPES.AGORIC_CONTRACT,
              instancePath: [STRING_CONSTANTS.INSTANCE.PATH],
              callPipe: [[STRING_CONSTANTS.OFFER_NAME]],
            },
            { give: { Fee: giveArgs } },
            { ...offerArgsValue },
            (update: { status: string; data?: unknown }) => {
              if (update.status === 'error') {
                handleRespone({
                  type: 'error',
                  payload: {
                    text: 'Error claiming tokens.',
                    data: update.data,
                  },
                });
                console.log(update);
              }
              if (update.status === 'accepted') {
                handleRespone({
                  type: 'success',
                  payload: { text: 'Token claimsuccess', data: update.data },
                });
              }
              if (update.status === 'refunded') {
                handleRespone({
                  type: 'refunded',
                  payload: { text: 'Tokens refunded', data: update.data },
                });
              }
              if (update.status === 'done') {
                console.log('Done!', update);
              }
            },
            `Offer-Airdrop-1`,
          );
        },
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
        nextActionFn: onClose,
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
                  onClick={content.nextActionFn}
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

export default Modal;
