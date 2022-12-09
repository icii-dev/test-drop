import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components';
import Input from './components/Input';
import UploadFile from './components/UploadFile';
import './mintnft.scss';

const MintNFT = () => {
    // address wallet
    const walletAddr = useSelector((state) => state.addr);
    const dispatch = useDispatch();

    const [dropAdddress, setDropAdddress] = useState('');
    const [amount, setAmount] = useState();
    const [Uri, setUri] = useState();

    const [startTime, setStartTime] = useState();
    const [endTime, setEndTime] = useState();
    const [maxClaimableSupply, setMaxClaimableSupply] = useState();
    const [supplyClaim, setSupplyClaim] = useState();
    const [quantity, setQuantity] = useState();
    const [white, setWhite] = useState();
    const [price, setPrice] = useState();
    const [currency, setCurrency] = useState();
    const [metadata, setMetadata] = useState();

    useEffect(() => {
        console.log('🚀 ~ file: index.js:14 ~ MintNFT ~ dropAdddress', dropAdddress);
    }, [dropAdddress]);

    const setClaimConditions = () => {
        // set claim conditions
    };

    const addNewClaim = () => {
        // addNewClaim
    };

    const lazyMint = () => {
        // lazyMint
    };

    return (
        <div className="mint-nft">
            {/* <div className="upload-div">
                <UploadFile />
            </div>
            <div>
                <Input />
            </div> */}

            <div className="left">
                <Input placeholder={'Drop Address'} setValue={setDropAdddress} />
                <Input placeholder={'Lazy Mint Amount'} type="number" setValue={setAmount} />
                <Input placeholder={'lazy Mint Uri'} setValue={setUri} />
                <Button.Primary label="Lazy Mint" onClick={lazyMint} />
            </div>

            <div className="right">
                <Input placeholder={'Start Time'} type="date" setValue={setStartTime} />
                <Input placeholder={'End Time'} type="date" setValue={setEndTime} />
                <Input placeholder={'Max Claimable Supply'} type="number" setValue={setMaxClaimableSupply} />
                <Input placeholder={'Supply Claimed'} type="number" setValue={setSupplyClaim} />
                <Input placeholder={'Quantity Limit Per Wallet'} type="number" setValue={setQuantity} />
                <Input placeholder={'White Listed Users'} setValue={setWhite} />
                <Input placeholder={'Price Per Token'} type="number" setValue={setPrice} />
                <Input placeholder={'Currency'} setValue={setCurrency} />
                <Input placeholder={'Metadata'} setValue={setMetadata} />

                <Button.Primary label="Set Claim Condition" onClick={setClaimConditions} />
                <Button.Primary label="Add New Claim" onClick={addNewClaim} />
            </div>
        </div>
    );
};

export default MintNFT;
