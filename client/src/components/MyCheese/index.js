import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";

import { Loader, Button, Card, Input, Table, Form, Field, Image } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import styles from '../../App.module.scss';


export default class MyCheeses extends Component {
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

        this.putOnSale = this.putOnSale.bind(this);
        this.cancelOnSale = this.cancelOnSale.bind(this);
    }

    ///--------------------------
    /// Handler
    ///-------------------------- 
    // handleCheeseNFTAddress(event) {
    //     this.setState({ valueCheeseNFTAddress: event.target.value });
    // }


    ///---------------------------------------------------------
    /// Functions put a cheese NFT on sale or cancel it on sale 
    ///---------------------------------------------------------
    putOnSale = async (e) => {
        const { web3, accounts, cheeseNFTMarketplace, cheeseNFTData, CHEESE_NFT_MARKETPLACE } = this.state;

        console.log('=== value of putOnSale ===', e.target.value);
        console.log('=== CHEESE_NFT_MARKETPLACE ===', CHEESE_NFT_MARKETPLACE);

        const CHEESE_NFT = e.target.value;

        /// Get instance by using created cheeseNFT address
        let CheeseNFT = {};
        CheeseNFT = require("../../../../build/contracts/CheeseNFT.json"); 
        let cheeseNFT = new web3.eth.Contract(CheeseNFT.abi, CHEESE_NFT);

        /// Check owner of cheeseId
        const cheeseId = 1;  /// [Note]: CheeseID is always 1. Because each cheeseNFT is unique.
        const owner = await cheeseNFT.methods.ownerOf(cheeseId).call();
        console.log('=== owner of cheeseId ===', owner);  /// [Expect]: Owner should be the CheeseNFTMarketplace.sol (This also called as a proxy/escrow contract)
            
        /// Put on sale (by a seller who is also called as owner)
        const txReceipt1 = await cheeseNFT.methods.approve(CHEESE_NFT_MARKETPLACE, cheeseId).send({ from: accounts[0] });
        const txReceipt2 = await cheeseNFTMarketplace.methods.openTrade(CHEESE_NFT, cheeseId).send({ from: accounts[0] });
        console.log('=== response of openTrade ===', txReceipt2);
    }

    cancelOnSale = async (e) => {
        const { web3, accounts, cheeseNFTMarketplace, cheeseNFTData, CHEESE_NFT_MARKETPLACE } = this.state;

        console.log('=== value of cancelOnSale ===', e.target.value);

        const CHEESE_NFT = e.target.value;

        /// Get instance by using created cheeseNFT address
        let CheeseNFT = {};
        CheeseNFT = require("../../../../build/contracts/CheeseNFT.json"); 
        let cheeseNFT = new web3.eth.Contract(CheeseNFT.abi, CHEESE_NFT);

        /// Check owner of cheeseId
        const cheeseId = 1;  /// [Note]: CheeseID is always 1. Because each cheeseNFT is unique.
        const owner = await cheeseNFT.methods.ownerOf(cheeseId).call();
        console.log('=== owner of cheeseId ===', owner);  /// [Expect]: Owner should be the CheeseNFTMarketplace.sol (This also called as a proxy/escrow contract)
            
        /// Cancel on sale
        //const txReceipt1 = await cheeseNFT.methods.approve(CHEESE_NFT_MARKETPLACE, cheeseId).send({ from: accounts[0] });
        const txReceipt2 = await cheeseNFTMarketplace.methods.cancelTrade(CHEESE_NFT, cheeseId).send({ from: accounts[0] });
        console.log('=== response of cancelTrade ===', txReceipt2);
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
            let CHEESE_NFT_MARKETPLACE;
            let deployedNetwork = null;

            // Create instance of contracts
            if (CheeseNFTMarketplace.networks) {
              deployedNetwork = CheeseNFTMarketplace.networks[networkId.toString()];
              if (deployedNetwork) {
                instanceCheeseNFTMarketplace = new web3.eth.Contract(
                  CheeseNFTMarketplace.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                CHEESE_NFT_MARKETPLACE = deployedNetwork.address;
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
                    cheeseNFTData: instanceCheeseNFTData,
                    CHEESE_NFT_MARKETPLACE: CHEESE_NFT_MARKETPLACE }, () => {
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
              <h2>My Cheeses</h2>

              { allCheeses.map((cheese, key) => {
                return (
                  <div key={key} className="">
                    <div className={styles.widgets}>

                        { currentAccount == cheese.ownerAddress ? 
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

                              <p>Owner: { cheese.ownerAddress }</p>
                              
                              <br />

                              { cheese.status == "Cancelled" ? 
                                  <Button size={'medium'} width={1} value={ cheese.cheeseNFT } onClick={this.putOnSale}> Put on sale </Button>
                              :
                                  <Button size={'medium'} width={1} value={ cheese.cheeseNFT } onClick={this.cancelOnSale}> Cancel on sale </Button>
                              }

                              <span style={{ padding: "5px" }}></span>
                            </Card>
                        :
                            ''
                        }

                    </div>
                  </div>
                )
              }) }
            </div>
        );
    }
}
