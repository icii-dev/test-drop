import { ADD_WALLET } from './type';

const defaultProps = {
    addr: '',
};

const appReducer = (state = defaultProps, action) => {
    switch (action.type) {
        case ADD_WALLET:
            return { addr: action.value };

        default:
            return state;
    }
};

export default appReducer;
