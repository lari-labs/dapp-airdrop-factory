import { ConnectWalletButton } from '@agoric/react-components';
import { NetworkDropdown } from '@agoric/react-components';

const Navbar = () => {
  return (
    <div className="daisyui-navbar bg-neutral text-neutral-content">
      {/* Agoric logo */}
      <div className="flex-none">
        <button className="daisyui-btn daisyui-btn-square daisyui-btn-ghost">
          <img src="/agoric.svg" />
        </button>
      </div>
      {/* dApp title */}
      <div className="flex-1">
        <button className="daisyui-btn daisyui-btn-ghost text-xl">
       Tribbles Invasion
        </button>
      </div>
      {/* network selector */}
      <div className="mx-2">
        <NetworkDropdown />
      </div>
      {/* connect wallet button */}
      <div className="flex-none">
        <ConnectWalletButton className="daisyui-btn daisyui-btn-outline daisyui-btn-secondary" />
      </div>
    </div>
  );
};

export { Navbar };
