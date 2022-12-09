import { ADD_WALLET } from './type';

const addWallet = (addr) => {
    return {
        type: ADD_WALLET,
        value: addr,
    };
};

export { addWallet };
