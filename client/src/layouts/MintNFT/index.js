/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components';
import Input from './components/Input';
import UploadFile from './components/UploadFile';
import './mintnft.scss';

// Needed to connect wallet and interact blockchain
import { Contract } from 'zksync-web3';
import { ethers } from 'ethers';

// Needed to generate Merkle tree/root/proof
import { MerkleTree } from 'merkletreejs';
import { Buffer } from 'buffer/';
window.Buffer = window.Buffer || Buffer;
const keccak256 = require('keccak256');

const MINT_CONTRACT_ABI = require('../../blockchain-data/mintabi.json');
const DROP_CONTRACT_ABI = require('../../blockchain-data/dropabi.json');
const DROP_FACTORY_CONTRACT_ABI = require('../../blockchain-data/dropfactoryabi.json');
const DROP_FACTORY_CONTRACT_ADDRESS = '0xb4508C9Cc093eF784ED5020bfB0DFB162EC181D8'; // testnet

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum);

const MintNFT = () => {
    // address wallet
    // const walletAddr = useSelector((state) => state.addr);
    // const dispatch = useDispatch();

    const [dropAdddress, setDropAdddress] = useState('');

    // Deploy Drop Contract
    const [contractName, setContractName] = useState('');
    const [contractSymbol, setContractSymbol] = useState('');
    const [contractOwnerAndSaleRecipient, setContractOwnerAndSaleRecipient] = useState('');

    // LazyMint
    const [lazyMintAmount, setLazyMintAmount] = useState();
    const [lazyMintUri, setLazyMintUri] = useState(); // ipfs://QmabicrMuVfz1KhDj45rEzVy7Y3jAeVR5L2xj8RsRrHGKh/

    // Drop condition
    const [metadata, setMetadata] = useState(); // Use as title of the drop phase
    const [startTime, setStartTime] = useState(); // GMT+7 Hanoi timezone
    const [endTime, setEndTime] = useState(); // GMT+7 Hanoi timezone
    const [maxClaimableSupply, setMaxClaimableSupply] = useState();
    const [supplyClaimed, setSupplyClaimed] = useState(0);
    const [quantityPerWallet, setQuantityPerWallet] = useState();
    const [whitelistedUsers, setWhitelistedUsers] = useState();
    const [pricePerToken, setPricePerToken] = useState(); // ETH
    const [saleCurrency, setSaleCurrency] = useState('0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'); // Native token = ETH
    const [resetClaimEligibility, setResetClaimEligibility] = useState(false); // If true will Reset supplyClaimedByWallet values when setting new claim conditions = New UID++ for new claim condition

    // Transaction link
    const [transactionLink, setTransactionLink] = useState('');
    const [deployedAddress, setDeployedAddress] = useState('');
    const [claimTransactionLink, setClaimTransactionLink] = useState('');

    // Claim Conditions Details
    const [claimConditionsDetailArray, setClaimConditionsDetailArray] = useState([]);

    // Current Active Claim Condition Detail
    const [activeClaimConditionDetail, setActiveClaimConditionDetail] = useState([]);

    // Claim
    const [claimQuantity, setClaimQuantity] = useState();

    const claimConditionComponent = (
        <>
            <Input placeholder={'Mint Campaign Name'} setValue={setMetadata} />
            <Input placeholder={'Start Time'} type="datetime-local" setValue={setStartTime} />
            <Input placeholder={'End Time'} type="datetime-local" setValue={setEndTime} />
            <Input placeholder={'Max Mintable Supply'} type="number" setValue={setMaxClaimableSupply} />
            <Input placeholder={'Quantity Limit Per Wallet'} type="number" setValue={setQuantityPerWallet} />
            <Input placeholder={'Whitelisted Users (seperate by , )'} setValue={setWhitelistedUsers} />
            <Input placeholder={'Price Per NFT (ETH)'} type="number" setValue={setPricePerToken} />
            <br></br>
        </>
    );
    const [claimConditionComponents, setClaimConditionComponents] = useState([claimConditionComponent]);

    // const getContractIndexInFactory = async () => {
    //     const signer = provider.getSigner();
    //     const dropContractFactory = new Contract(DROP_FACTORY_CONTRACT_ADDRESS, DROP_FACTORY_CONTRACT_ABI, signer);
    //     let totalDeployedContracts = await dropContractFactory.getDeployedContracts();
    //     let contractIndex = totalDeployedContracts.indexOf(dropAdddress);
    //     return contractIndex;
    // };

    const deployContract = async () => {
        const signer = provider.getSigner();
        const dropContractFactory = new Contract(DROP_FACTORY_CONTRACT_ADDRESS, DROP_FACTORY_CONTRACT_ABI, signer);
        const deployContractTx = await dropContractFactory.createNewDropContract(
            contractName,
            contractSymbol,
            contractOwnerAndSaleRecipient,
        );
        setDeployedAddress('Waiting Contract Address...');
        setTransactionLink(`https://zksync2-testnet.zkscan.io/tx/${deployContractTx['hash']}`);

        await new Promise((r) => setTimeout(r, 20000));

        let deployedContractsLength = await dropContractFactory.getDeployedContractsLength();
        let recentDeployedContract = await dropContractFactory.ERC721DropArray(deployedContractsLength - 1);
        setDeployedAddress(recentDeployedContract);
    };

    const lazyMint = async () => {
        const signer = provider.getSigner();
        const dropContract = new Contract(dropAdddress, DROP_CONTRACT_ABI, signer);
        // const dropContractFactory = new Contract(DROP_FACTORY_CONTRACT_ADDRESS, DROP_FACTORY_CONTRACT_ABI, signer);
        // const contractIndex = await getContractIndexInFactory();
        const lazyMintTx = await dropContract.lazyMint(lazyMintAmount, lazyMintUri);
        setTransactionLink(`https://zksync2-testnet.zkscan.io/tx/${lazyMintTx['hash']}`);

        setDeployedAddress('');
    };

    const setClaimConditions = async () => {
        const signer = provider.getSigner();
        const dropContract = new Contract(dropAdddress, DROP_CONTRACT_ABI, signer);

        let merkleRoot;
        let fiveHoursInSeconds = 5 * 60 * 60;

        // Convert datetime-local (GMT+7 Hanoi timezone) to Unix Timestamp by reduce 7hours=25200seconds
        let startTimestamp = +new Date(startTime) - fiveHoursInSeconds;
        let endTimestamp = +new Date(endTime) - fiveHoursInSeconds;

        // Truncate last 3 digits because miliseconds to seconds
        startTimestamp = parseInt(startTimestamp.toString().slice(0, -3));
        endTimestamp = parseInt(endTimestamp.toString().slice(0, -3));

        // if empty means public mint (everyone can mint)
        if (!whitelistedUsers) {
            merkleRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';
        } else {
            // Calculate merkle tree
            // Convert whitelisted users String to Array
            var whitelistedUsersArray = whitelistedUsers.split(',').map(function (n) {
                return n;
            });
            // Hash addresses to get the leaves
            let leaves = whitelistedUsersArray.map((addr) => keccak256(addr)); // TODO Push leaves to Database
            // Create merkle tree, root
            let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
            merkleRoot = '0x' + merkleTree.getRoot().toString('hex');
        }

        // Calculate ETH to Wei
        const weiPricePerToken = ethers.utils.parseUnits(pricePerToken.toString(), 'ether');

        let claimCondition = [
            startTimestamp,
            endTimestamp,
            maxClaimableSupply,
            supplyClaimed,
            quantityPerWallet,
            merkleRoot,
            weiPricePerToken,
            saleCurrency,
            metadata,
        ];

        const setClaimConditionTx = await dropContract.setClaimConditions([claimCondition], resetClaimEligibility);
        setTransactionLink(`https://zksync2-testnet.zkscan.io/tx/${setClaimConditionTx['hash']}`);

        setDeployedAddress('');
    };

    // const addNewClaimCondition = () => {
    //     // addNewClaimCondition
    // };

    const getClaimConditions = async () => {
        if (dropAdddress === '') {
            return;
        }
        const signer = provider.getSigner();
        const dropContract = new Contract(dropAdddress, DROP_CONTRACT_ABI, signer);

        // Get Claim Conditions Count
        const claimConditionTx = await dropContract.claimCondition();
        const totalConditionsCount = claimConditionTx.count.toNumber();
        const conditionStartId = claimConditionTx.currentStartId.toNumber();

        // Have no condition set
        if (totalConditionsCount === 0) {
            return 0;
        }

        // Get Current Active Claim Condition
        var activeConditionId;
        try {
            const activeClaimConditionTx = await dropContract.getActiveClaimConditionId();
            activeConditionId = activeClaimConditionTx.toNumber();
        } catch {
            activeConditionId = -1;
        }

        let tempClaimConditionsDetailArray = [];

        // Extract all claim conditions details
        for (let i = conditionStartId; i < totalConditionsCount; i++) {
            let claimCondition = await dropContract.getClaimConditionById(i);

            let tempClaimConditionDetail = [];
            let tempMetadata = claimCondition.metadata;
            let tempStartTimestamp = new Date(claimCondition.startTimestamp.toNumber() * 1000).toUTCString(); // Convert UNIX timestamp to UTC datetime
            let tempEndTimestamp = new Date(claimCondition.endTimestamp.toNumber() * 1000).toUTCString(); // Convert UNIX timestamp to UTC datetime
            let tempPricePerTokenInEth = ethers.utils.formatEther(claimCondition.pricePerToken.toString()); // Convert Wei to Ether
            let tempMaxSupply = claimCondition.maxClaimableSupply.toNumber();
            let tempLimitPerWallet = claimCondition.quantityLimitPerWallet.toNumber();

            tempClaimConditionDetail.push(
                tempMetadata,
                tempStartTimestamp,
                tempEndTimestamp,
                tempPricePerTokenInEth,
                tempMaxSupply,
                tempLimitPerWallet,
            );

            tempClaimConditionsDetailArray.push(tempClaimConditionDetail);

            // Set state for current active claim
            if (i === activeConditionId) {
                setActiveClaimConditionDetail(tempClaimConditionDetail);
            }
        }
        setClaimConditionsDetailArray(tempClaimConditionsDetailArray);
    };

    const claim = async () => {
        const signer = provider.getSigner();
        const dropContract = new Contract(dropAdddress, DROP_CONTRACT_ABI, signer);

        // Convert to Wei
        let tempPricePerTokenInWei = ethers.utils.parseUnits(activeClaimConditionDetail[3].toString(), 'ether');

        // Before claim, we have to calculate merkle proof for user
        let currentAddress = signer.getAddress();
        // Remove after can get leaves from DB
        let tempListOfWhitelistedAddresses = [
            currentAddress[0],
            '0x1bEf533463EDCF4bbe86f250666257b8a2e2730c',
            '0x0583f65Cc4AcC0E45cf2D06b6975Df099B37cD89',
        ];
        let leaves = tempListOfWhitelistedAddresses.map((addr) => keccak256(addr)); // TODO Get leaves from DB
        let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
        let hashedAddress = keccak256(currentAddress[0]);
        let proof = merkleTree.getHexProof(hashedAddress);

        let AllowlistProof = [proof, '1', '1', '0x0000000000000000000000000000000000000000']; // Default values
        try {
            const claimTx = await dropContract.claim(
                signer.getAddress(),
                claimQuantity,
                saleCurrency,
                tempPricePerTokenInWei,
                AllowlistProof,
                '0x00',
                { value: ethers.BigNumber.from(tempPricePerTokenInWei * claimQuantity) },
            );
            setClaimTransactionLink(`https://zksync2-testnet.zkscan.io/tx/${claimTx['hash']}`);
        } catch (e) {
            if (e.data.message.search('!Qty') !== -1) {
                setClaimTransactionLink('Maxed mint limit per wallet!');
            } else if (e.data.message.search('!MaxSupply') !== -1) {
                setClaimTransactionLink('Maxed supply mint limit!');
            } else if (e.data.message.search('Claim time over') !== -1) {
                setClaimTransactionLink('Claim time over!');
            } else if (e.data.message.search('Not claim time yet') !== -1) {
                setClaimTransactionLink('Not claim time yet!');
            } else {
                setClaimTransactionLink('Not allowed to mint');
            }
        }
    };

    return (
        <div>
            <div className="mint-nft">
                <h1 className="title big-text">Create Airdrop NFT</h1>
                {/* <div className="upload-div">
                <UploadFile />
            </div>
            <div>
                <Input />
            </div> */}
                <div className="">
                    <Input placeholder={'Airdrop Address'} setValue={setDropAdddress} />
                </div>
                <div className="bottom">
                    <div className="left">
                        <Input placeholder={'Name NFT'} setValue={setContractName} />
                        <Input placeholder={'Symbol NFT'} setValue={setContractSymbol} />
                        <Input placeholder={'Sale Recipient'} setValue={setContractOwnerAndSaleRecipient} />
                        <Button.Primary label="Deploy NFT" onClick={deployContract} />
                    </div>
                    <div className="left">
                        <Input placeholder={'Lazy Mint Amount'} type="number" setValue={setLazyMintAmount} />
                        <Input placeholder={'Lazy Mint Uri'} setValue={setLazyMintUri} />
                        <Button.Primary label="Lazy Mint" onClick={lazyMint} />
                    </div>

                    <div className="right">
                        {/* <div>
                            <Input placeholder={'Mint Campaign Name'} setValue={setMetadata} />
                            <Input placeholder={'Start Time'} type="datetime-local" setValue={setStartTime} />
                            <Input placeholder={'End Time'} type="datetime-local" setValue={setEndTime} />
                            <Input placeholder={'Max Mintable Supply'} type="number" setValue={setMaxClaimableSupply} />
                            <Input
                                placeholder={'Quantity Limit Per Wallet'}
                                type="number"
                                setValue={setQuantityPerWallet}
                            />
                            <Input placeholder={'Whitelisted Users (seperate by , )'} setValue={setWhitelistedUsers} />
                            <Input placeholder={'Price Per NFT (ETH)'} type="number" setValue={setPricePerToken} />
                        </div> */}
                        {claimConditionComponents.map((item, index) => (
                            <div className="component" key={index}>
                                <Input placeholder={'Mint Campaign Name'} setValue={setMetadata} />
                                <Input placeholder={'Start Time'} type="datetime-local" setValue={setStartTime} />
                                <Input placeholder={'End Time'} type="datetime-local" setValue={setEndTime} />
                                <Input
                                    placeholder={'Max Mintable Supply'}
                                    type="number"
                                    setValue={setMaxClaimableSupply}
                                />
                                <Input
                                    placeholder={'Quantity Limit Per Wallet'}
                                    type="number"
                                    setValue={setQuantityPerWallet}
                                />
                                <Input
                                    placeholder={'Whitelisted Users (seperate by , )'}
                                    setValue={setWhitelistedUsers}
                                />
                                <Input placeholder={'Price Per NFT (ETH)'} type="number" setValue={setPricePerToken} />
                                <br></br>
                            </div>
                        ))}
                        <Button.Primary label="Set Mint Condition" onClick={setClaimConditions} />
                        <Button.Primary
                            label="Add"
                            onClick={() =>
                                setClaimConditionComponents([...claimConditionComponents, claimConditionComponent])
                            }
                        />
                        {claimConditionComponents.length !== 1 ? (
                            <Button.Primary
                                label="Remove"
                                onClick={() => {
                                    let tempClaimConditionComponents = claimConditionComponents.slice(0, -1);
                                    setClaimConditionComponents(tempClaimConditionComponents);
                                }}
                            />
                        ) : (
                            ''
                        )}
                    </div>
                </div>
                <p className="title">{deployedAddress}</p>
                <a className="title" target="blank" href={transactionLink}>
                    {transactionLink}
                </a>
            </div>
            <br></br>
            <div className="mint-nft">
                <div className="bottom">
                    <div className="left">
                        <h1 className="information big-text">
                            {getClaimConditions() === 0 ? 'Mint Schedule' : 'No Mint Schedule'}
                        </h1>

                        {claimConditionsDetailArray.map((childArray, id) => {
                            return (
                                <div key={id}>
                                    <h2 className="information">{childArray[0]}</h2>
                                    <p className="information">Start: {childArray[1]}</p>
                                    <p className="information">End: {childArray[2]}</p>
                                    <p className="information">Price: {childArray[3]} ETH</p>
                                    <p className="information">Supply: {childArray[4]} NFTs</p>
                                    <p className="information">Limit {childArray[5]} per Wallet</p>
                                </div>
                            );
                        })}

                        <Button.Primary label="Get Mint Schedule" onClick={getClaimConditions} />
                    </div>
                    <div className="right">
                        {activeClaimConditionDetail.length > 0 ? (
                            <div className="right">
                                <h1 className="information big-text">Mint Now</h1>
                                <h2 className="information">{activeClaimConditionDetail[0]}</h2>
                                <p className="information">Price: {activeClaimConditionDetail[3]} ETH</p>
                                <p className="information">Limit {activeClaimConditionDetail[5]} per Wallet</p>
                                <Input placeholder={'Number of NFT'} type="number" setValue={setClaimQuantity} />
                                <Button.Primary label="Mint" onClick={claim} />
                            </div>
                        ) : (
                            <div>
                                <h1 className="information big-text">
                                    {getClaimConditions() === 0 ? 'No Minting Now' : ''}
                                </h1>
                            </div>
                        )}
                    </div>
                </div>
                {claimTransactionLink.search('https://zksync2-testnet.zkscan.io') === -1 ? (
                    <p className="title">{claimTransactionLink}</p>
                ) : (
                    <a className="title" target="blank" href={claimTransactionLink}>
                        {claimTransactionLink}
                    </a>
                )}
            </div>
        </div>
    );
};

export default MintNFT;
