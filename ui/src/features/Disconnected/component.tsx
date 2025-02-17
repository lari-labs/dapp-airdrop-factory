import { motion } from 'framer-motion';

const DisconnectedComponent = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{
      duration: 0.3,
    }}
    className="prose"
  >
    <div className="prose border-1 border-c max-w-md  rounded-lg p-3 p-8 p-8 shadow-lg shadow-purple-500/50 ">
      <div className="mb-6 flex flex-col items-center justify-around">
        <div className="relative flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl border-2 border-purple-500 bg-[#2b2836] p-3 shadow-lg shadow-purple-500/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="h-full w-full"
            fill="white"
          >
            <polygon points="50,15 90,80 10,80" />
          </svg>
        </div>
        <h2 className="font-baumans prose-stone text-center text-4xl text-white">
          Tribbles Airdrop Redemption
        </h2>
        <p className="font-baumans text-center text-lg text-white">
          Connect your wallet to check eligibility.
        </p>
      </div>
    </div>
  </motion.div>
);

export default DisconnectedComponent;
