import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";

import { Loader, Button, Card, Input, Table, Form, Field, Image } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import styles from '../../App.module.scss';


export default class CheeseMarketplace extends Component {
    constructor(props) {    
        super(props);

        this.state = {
          /////// Default state
          storageValue: 0,
          web3: null,
          accounts: null,
          currentAccount: null,          
          route: window.location.pathname.replace("/", ""),

          /////// NFT
          allCheeses: []
        };

        //this.handleCheeseNFTAddress = this.handleCheeseNFTAddress.bind(this);

        this.buyCheeseNFT = this.buyCheeseNFT.bind(this);
        this.addReputation = this.addReputation.bind(this);
    }

    ///--------------------------
    /// Handler
    ///-------------------------- 
    // handleCheeseNFTAddress(event) {
    //     this.setState({ valueCheeseNFTAddress: event.target.value });
    // }


    ///---------------------------------
    /// Functions of buying a cheese NFT 
    ///---------------------------------
    buyCheeseNFT = async (e) => {
        const { web3, accounts, cheeseNFTMarketplace, cheeseNFTData } = this.state;
        //const { web3, accounts, cheeseNFTMarketplace, cheeseNFTData, valueCheeseNFTAddress } = this.state;

        console.log('=== value of buyCheeseNFT ===', e.target.value);

        const CHEESE_NFT = e.target.value;
        //const CHEESE_NFT = valueCheeseNFTAddress;
        //this.setState({ valueCheeseNFTAddress: "" });

        /// Get instance by using created cheeseNFT address
        let CheeseNFT = {};
        CheeseNFT = require("../../../../build/contracts/CheeseNFT.json"); 
        let cheeseNFT = new web3.eth.Contract(CheeseNFT.abi, CHEESE_NFT);

        /// Check owner of cheeseId
        const cheeseId = 1;  /// [Note]: CheeseID is always 1. Because each cheeseNFT is unique.
        const owner = await cheeseNFT.methods.ownerOf(cheeseId).call();
        console.log('=== owner of cheeseId ===', owner);  /// [Expect]: Owner should be the CheeseNFTMarketplace.sol (This also called as a proxy/escrow contract)

        const cheese = await cheeseNFTData.methods.getCheeseByNFTAddress(CHEESE_NFT).call();
        const buyAmount = await cheese.cheesePrice;
        const txReceipt1 = await cheeseNFTMarketplace.methods.buyCheeseNFT(CHEESE_NFT).send({ from: accounts[0], value: buyAmount });
        console.log('=== response of buyCheeseNFT ===', txReceipt1);
    }


    ///--------------------------
    /// Functions of reputation 
    ///---------------------------
    addReputation = async () => {
        const { accounts, cheeseNFTMarketplace } = this.state;

        let _from2 = "0x2cb2418B11B66E331fFaC7FFB0463d91ef8FE8F5"
        let _to2 = accounts[0]
        let _tokenId2 = 1
        const response_1 = await cheeseNFTMarketplace.methods.reputation(_from2, _to2, _tokenId2).send({ from: accounts[0] })
        console.log('=== response of reputation function ===', response_1);      // Debug

        const response_2 = await cheeseNFTMarketplace.methods.getReputationCount(_tokenId2).call()
        console.log('=== response of getReputationCount function ===', response_2);      // Debug
    }


    ///------------------------------------- 
    /// NFT（Always load listed NFT data）
    ///-------------------------------------
    getAllCheeses = async () => {
        const { cheeseNFTData } = this.state

        const allCheeses = await cheeseNFTData.methods.getAllCheeses().call()
        console.log('=== allCheeses ===', allCheeses)

        this.setState({ allCheeses: allCheeses })
        return allCheeses
    }


    //////////////////////////////////// 
    /// Ganache
    ////////////////////////////////////
    getGanacheAddresses = async () => {
        if (!this.ganacheProvider) {
          this.ganacheProvider = getGanacheWeb3();
        }
        if (this.ganacheProvider) {
          return await this.ganacheProvider.eth.getAccounts();
        }
        return [];
    }

    componentDidMount = async () => {
        const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
     
        let CheeseNFTMarketplace = {};
        let CheeseNFTData = {};
        try {
          CheeseNFTMarketplace = require("../../../../build/contracts/CheeseNFTMarketplace.json");
          CheeseNFTData = require("../../../../build/contracts/CheeseNFTData.json");
        } catch (e) {
          console.log(e);
        }

        try {
          const isProd = process.env.NODE_ENV === 'production';
          if (!isProd) {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
            let ganacheAccounts = [];

            try {
              ganacheAccounts = await this.getGanacheAddresses();
            } catch (e) {
              console.log('Ganache is not running');
            }

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            const currentAccount = accounts[0];

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const networkType = await web3.eth.net.getNetworkType();
            const isMetaMask = web3.currentProvider.isMetaMask;
            let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
            balance = web3.utils.fromWei(balance, 'ether');

            let instanceCheeseNFTMarketplace = null;
            let instanceCheeseNFTData = null;
            let deployedNetwork = null;

            // Create instance of contracts
            if (CheeseNFTMarketplace.networks) {
              deployedNetwork = CheeseNFTMarketplace.networks[networkId.toString()];
              if (deployedNetwork) {
                instanceCheeseNFTMarketplace = new web3.eth.Contract(
                  CheeseNFTMarketplace.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                console.log('=== instanceCheeseNFTMarketplace ===', instanceCheeseNFTMarketplace);
              }
            }

            if (CheeseNFTData.networks) {
              deployedNetwork = CheeseNFTData.networks[networkId.toString()];
              if (deployedNetwork) {
                instanceCheeseNFTData = new web3.eth.Contract(
                  CheeseNFTData.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                console.log('=== instanceCheeseNFTData ===', instanceCheeseNFTData);
              }
            }

            if (instanceCheeseNFTMarketplace) {
                // Set web3, accounts, and contract to the state, and then proceed with an
                // example of interacting with the contract's methods.
                this.setState({ 
                    web3, 
                    ganacheAccounts, 
                    accounts, 
                    balance, 
                    networkId, 
                    networkType, 
                    hotLoaderDisabled,
                    isMetaMask, 
                    currentAccount: currentAccount, 
                    cheeseNFTMarketplace: instanceCheeseNFTMarketplace,
                    cheeseNFTData: instanceCheeseNFTData }, () => {
                      this.refreshValues(instanceCheeseNFTMarketplace);
                      setInterval(() => {
                        this.refreshValues(instanceCheeseNFTMarketplace);
                    }, 5000);
                });
            }
            else {
              this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled, isMetaMask });
            }

            ///@dev - NFT（Always load listed NFT data
            const allCheeses = await this.getAllCheeses();
            this.setState({ allCheeses: allCheeses })
          }
        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
          );
          console.error(error);
        }
    };

    componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
    }

    refreshValues = (instanceCheeseNFTMarketplace) => {
        if (instanceCheeseNFTMarketplace) {
          console.log('refreshValues of instanceCheeseNFTMarketplace');
        }
    }

    render() {
        const { web3, allCheeses, currentAccount } = this.state;

        return (
            <div className={styles.contracts}>
              <h2>NFT based Cheese MarketPlace</h2>

              { allCheeses.map((cheese, key) => {
                return (
                  <div key={key} className="">
                    <div className={styles.widgets}>

                        { currentAccount != cheese.ownerAddress && cheese.status == "Open" ?
                            <Card width={"360px"} 
                                      maxWidth={"360px"} 
                                      mx={"auto"} 
                                      my={5} 
                                      p={20} 
                                      borderColor={"#E8E8E8"}
                            >
                                <Image
                                  alt="random unsplash image"
                                  borderRadius={8}
                                  height="100%"
                                  maxWidth='100%'
                                  src={ `https://ipfs.io/ipfs/${cheese.ipfsHashOfCheese}` }
                                />

                                <span style={{ padding: "20px" }}></span>

                                <p>Cheese Name: { cheese.cheeseNFTName }</p>

                                <p>Price: { web3.utils.fromWei(`${cheese.cheesePrice}`, 'ether') } ETH</p>

                                {/* <p>NFT Address: { cheese.cheeseNFT }</p> */}

                                <p>Owner: { cheese.ownerAddress }</p>

                                {/* <p>Reputation Count: { cheese.reputation }</p> */}
                                
                                <br />

                                {/* <hr /> */}

                                {/* 
                                <Field label="Please input a NFT Address as a confirmation to buy">
                                    <Input
                                        type="text"
                                        width={1}
                                        placeholder="e.g) 0x6d7d6fED69E7769C294DE41a28aF9E118567Bc81"
                                        required={true}
                                        value={this.state.valueCheeseNFTAddress} 
                                        onChange={this.handleCheeseNFTAddress}                                        
                                    />
                                </Field>
                                */}

                                <Button size={'medium'} width={1} value={ cheese.cheeseNFT } onClick={this.buyCheeseNFT}> Buy </Button>

                                {/* <Button size={'small'} value={ cheese.cheeseNFT } onClick={this.buyCheeseNFT}> Buy </Button> */}

                                {/* <span style={{ padding: "5px" }}></span> */}

                                {/* <Button size={'small'} onClick={this.addReputation}> Rep </Button> */}

                                <span style={{ padding: "5px" }}></span>
                            </Card>
                        :
                            "" 
                        }

                    </div>
                  </div>
                )
              }) }
            </div>
        );
    }
}
