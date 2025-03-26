// @ts-ignore
import acvm from '@noir-lang/acvm_js/web/acvm_js_bg.wasm?url';
// @ts-ignore
import noirc from '@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url';
import initNoirC from '@noir-lang/noirc_abi';
import initACVM from '@noir-lang/acvm_js';
// @ts-ignore
await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))]);
import './index.css';
import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { defineChain, createClient } from 'viem';
import { injected } from 'wagmi/connectors';
import { networkConfig } from '../../deployment.json';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Home from './components/Home/Home.jsx';
const queryClient = new QueryClient();
import Component from './components/index.jsx';
const { id, name, nativeCurrency, rpcUrls } = networkConfig;
const chain = defineChain({
    id,
    name,
    nativeCurrency,
    rpcUrls,
});

const config = createConfig({
    connectors: [injected()],
    chains: [chain],
    client({ chain }) {
        return createClient({ chain, transport: http() });
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    sessionStorage.setItem(
        'neighbours',
        JSON.stringify([
            ['0', 'B'],
            ['A', 'C'],
            ['B', 'D'],
            ['C', 'E'],
            ['D', 'F'],
            ['E', '1'],
        ]),
    );

    React.useEffect(() => setMounted(true), []);
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID!}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>{mounted && children}</QueryClientProvider>
            </WagmiProvider>
        </GoogleOAuthProvider>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Providers>
        <Home />
        <ToastContainer />
    </Providers>,
);
