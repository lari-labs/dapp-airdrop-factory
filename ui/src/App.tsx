import { ContractProvider } from './providers/Contract';
import { AgoricProvider } from '@agoric/react-components';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';
import { Navbar } from './components/Navbar';
import { Tabs } from './components/Tabs';
import { wallets } from 'cosmos-kit';
import { useTheme } from '@interchain-ui/react';
import Layout from './shared/layout/component';

import '@agoric/react-components/dist/style.css';
import CheckEligibility from './features/CheckEligibility/component.tsx';
import { motion } from 'framer-motion';
// import { Button, Modal } from 'react-daisyui';

const AnimateWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);
function App() {
  return (
    <Layout>
      <AgoricProvider
        // @ts-expect-error XXX _chainWalletMap' is protected but type 'MainWalletBase' is not a class derived from 'MainWalletBase
        wallets={wallets.extension}
        agoricNetworkConfigs={[
          {
            testChain: {
              chainId: 'agoriclocal',
              chainName: 'agoric-local',
              iconUrl: 'agoric.svg', // Optional icon for dropdown display
            },
            apis: {
              rest: ['http://localhost:1317'],
              rpc: ['http://localhost:26657'],
            },
          },
          {
            testChain: {
              chainId: 'agoricxnet-14',
              chainName: 'agoricxnet',
              iconUrl: 'agoric.svg', // Optional icon for dropdown display
            },
            apis: {
              rest: ['https://xnet.api.agoric.net'],
              rpc: ['https://xnet.rpc.agoric.net'],
            },
          },
        ]}
        defaultChainName="agoricxnet"
      >
        <ContractProvider>
          <Outlet />
        </ContractProvider>
      </AgoricProvider>
    </Layout>
  );
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<CheckEligibility />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
