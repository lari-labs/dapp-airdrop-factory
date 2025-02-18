// // Early return while loading to prevent flickering
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { formatPurseValue } from '../../shared/utilities/index.js';
// if (!isInitialized) {
//   return (
//     <div className="flex min-w-[500px] items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         className="flex items-center space-x-2"
//       >
//         <Loader2 className="animate-spin" size={24} />
//         <span className="text-white">Loading...</span>
//       </motion.div>
//     </div>
//   );
// }

const AlreadyClaimed = ({ tribblesPurse }) => (
  <div className="flex min-w-[500px] items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl rounded-2xl bg-transparent p-8 shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] backdrop-blur-sm"
    >
      <div className="flex flex-col items-center space-y-4">
        <CheckCircle2 size={64} className="text-green-600" />
        <h2 className="text-2xl font-bold text-white">
          Tokens Already Claimed!
        </h2>
        <p className="text-center text-lg text-white">
          You have already claimed {formatPurseValue(tribblesPurse)} $TRIBBLES.
        </p>
      </div>
    </motion.div>
  </div>
);
export default AlreadyClaimed;
