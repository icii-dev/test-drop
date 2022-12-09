import './connectwallet.scss';
import { ethers } from 'ethers';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addWallet } from '../../../redux/action';

const ConnectWallet = () => {
    const [connected, setConnected] = useState(false);

    const walletAddr = useSelector((state) => state.addr);
    const dispatch = useDispatch();

    const chainId = 280; // zksync testnet
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const handleClick = async () => {
        // Check metamask installed
        var alerted = false;
        if (!window.ethereum && alerted === false) {
            alert('install metamask extension!!!');
            alerted = true;
        }

        // Check change network to zksync mainnet/testnet
        if (window.ethereum.networkVersion !== chainId.toString()) {
            const hexChainId = '0x' + chainId.toString(16);
            try {
                console.log('requesting network change to zksync');
                await provider.send('wallet_switchEthereumChain', [{ chainId: hexChainId }]);
            } catch (err) {
                // This error code indicates that the chain has not been added to MetaMask
                if (err.code === 4902) {
                    await provider.send('wallet_addEthereumChain', [
                        {
                            chainName: 'zkSync alpha testnet',
                            chainId: hexChainId,
                            rpcUrls: ['https://zksync2-testnet.zksync.dev'],
                        },
                    ]);
                }
            }
        }

        // Check if have right network or not
        if (window.ethereum.networkVersion === chainId.toString()) {
            // MetaMask requires requesting permission to connect users accounts
            let accounts = await provider.send('eth_requestAccounts', []);
            if (accounts) {
                dispatch(addWallet(accounts));
                setConnected(true);
            }
        }
    };

    return (
        <div className="connect-wallet" onClick={handleClick}>
            {connected ? walletAddr : 'Connect Wallet'}
        </div>
    );
};

export default ConnectWallet;
