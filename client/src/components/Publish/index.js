import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";
import ipfs from '../ipfs/ipfsApi.js'

import { Grid } from '@material-ui/core';
import { Loader, Button, Card, Input, Heading, Table, Form, Field } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import styles from '../../App.module.scss';


export default class Publish extends Component {
    constructor(props) {    
        super(props);

        this.state = {
          /////// Default state
          storageValue: 0,
          web3: null,
          accounts: null,
          route: window.location.pathname.replace("/", ""),

          /////// NFT concern
          valueNFTName: '',
          valueNFTSymbol: '',
          valueCheesePrice: '',

          /////// Ipfs Upload
          buffer: null,
          ipfsHash: ''
        };

        /////// Handle
        this.handleNFTName = this.handleNFTName.bind(this);
        this.handleNFTSymbol = this.handleNFTSymbol.bind(this);
        this.handleCheesePrice = this.handleCheesePrice.bind(this);

        /////// Ipfs Upload
        this.captureFile = this.captureFile.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }


    ///--------------------------
    /// Handler
    ///-------------------------- 
    handleNFTName(event) {
        this.setState({ valueNFTName: event.target.value });
    }

    handleNFTSymbol(event) {
        this.setState({ valueNFTSymbol: event.target.value });
    }

    handleCheesePrice(event) {
        this.setState({ valueCheesePrice: event.target.value });
    }

    ///--------------------------
    /// Functions of ipfsUpload 
    ///-------------------------- 
    captureFile(event) {
        event.preventDefault()
        const file = event.target.files[0]
        
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)  // Read bufffered file

        // Callback
        reader.onloadend = () => {
          this.setState({ buffer: Buffer(reader.result) })
          console.log('=== buffer ===', this.state.buffer)
        }
    }
      
    onSubmit(event) {
        const { web3, accounts, cheeseNFTFactory, cheeseNFTMarketplace, CHEESE_NFT_MARKETPLACE, valueNFTName, valueNFTSymbol, valueCheesePrice } = this.state;

        event.preventDefault()

        ipfs.files.add(this.state.buffer, (error, result) => {
          // In case of fail to upload to IPFS
          if (error) {
            console.error(error)
            return
          }

          // In case of successful to upload to IPFS
          this.setState({ ipfsHash: result[0].hash });
          console.log('=== ipfsHash ===', this.state.ipfsHash);

          const nftName = valueNFTName;
          const nftSymbol = "NFT-MARKETPLACE";  /// [Note]: All NFT's symbol are common symbol
          //const nftSymbol = valueNFTSymbol;
          const _cheesePrice = valueCheesePrice;
          console.log('=== nftName ===', nftName);
          console.log('=== nftSymbol ===', nftSymbol);
          console.log('=== _cheesePrice ===', _cheesePrice);
          this.setState({ 
            valueNFTName: '',
            valueNFTSymbol: '',
            valueCheesePrice: ''
          });

          //let CHEESE_NFT;  /// [Note]: This is a cheeseNFT address created
          const cheesePrice = web3.utils.toWei(_cheesePrice, 'ether');
          const ipfsHashOfCheese = this.state.ipfsHash;
          cheeseNFTFactory.methods.createNewCheeseNFT(nftName, nftSymbol, cheesePrice, ipfsHashOfCheese).send({ from: accounts[0] })
          .once('receipt', (receipt) => {
            console.log('=== receipt ===', receipt);

            const CHEESE_NFT = receipt.events.CheeseNFTCreated.returnValues.cheeseNFT;
            console.log('=== CHEESE_NFT ===', CHEESE_NFT);

            /// Get instance by using created cheeseNFT address
            let CheeseNFT = {};
            CheeseNFT = require("../../../../build/contracts/CheeseNFT.json"); 
            let cheeseNFT = new web3.eth.Contract(CheeseNFT.abi, CHEESE_NFT);
            console.log('=== cheeseNFT ===', cheeseNFT);
     
            /// Check owner of cheeseId==1
            const cheeseId = 1;  /// [Note]: CheeseID is always 1. Because each cheeseNFT is unique.
            cheeseNFT.methods.ownerOf(cheeseId).call().then(owner => console.log('=== owner of cheeseId 1 ===', owner));
            
            /// [Note]: Promise (nested-structure) is needed for executing those methods below (Or, rewrite by async/await)
            cheeseNFT.methods.approve(CHEESE_NFT_MARKETPLACE, cheeseId).send({ from: accounts[0] }).once('receipt', (receipt) => {
                /// Put on sale (by a seller who is also called as owner)
                cheeseNFTMarketplace.methods.openTradeWhenCreateNewCheeseNFT(CHEESE_NFT, cheeseId, cheesePrice).send({ from: accounts[0] }).once('receipt', (receipt) => {})
            })
          })
        })
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
     
        let CheeseNFTFactory = {};
        let CheeseNFTMarketplace = {};
        try {
          CheeseNFTFactory = require("../../../../build/contracts/CheeseNFTFactory.json"); // Load ABI of contract of CheeseNFTFactory
          CheeseNFTMarketplace = require("../../../../build/contracts/CheeseNFTMarketplace.json");
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
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const networkType = await web3.eth.net.getNetworkType();
            const isMetaMask = web3.currentProvider.isMetaMask;
            let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
            balance = web3.utils.fromWei(balance, 'ether');

            let instanceCheeseNFTFactory = null;
            let instanceCheeseNFTMarketplace = null;
            let CHEESE_NFT_MARKETPLACE;
            let deployedNetwork = null;

            // Create instance of contracts
            if (CheeseNFTFactory.networks) {
              deployedNetwork = CheeseNFTFactory.networks[networkId.toString()];
              if (deployedNetwork) {
                instanceCheeseNFTFactory = new web3.eth.Contract(
                  CheeseNFTFactory.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                console.log('=== instanceCheeseNFTFactory ===', instanceCheeseNFTFactory);
              }
            }

            if (CheeseNFTMarketplace.networks) {
              deployedNetwork = CheeseNFTMarketplace.networks[networkId.toString()];
              if (deployedNetwork) {
                instanceCheeseNFTMarketplace = new web3.eth.Contract(
                  CheeseNFTMarketplace.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                CHEESE_NFT_MARKETPLACE = deployedNetwork.address;
                console.log('=== instanceCheeseNFTMarketplace ===', instanceCheeseNFTMarketplace);
                console.log('=== CHEESE_NFT_MARKETPLACE ===', CHEESE_NFT_MARKETPLACE);
              }
            }

            if (instanceCheeseNFTFactory) {
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
                    cheeseNFTFactory: instanceCheeseNFTFactory,
                    cheeseNFTMarketplace: instanceCheeseNFTMarketplace, 
                    CHEESE_NFT_MARKETPLACE: CHEESE_NFT_MARKETPLACE }, () => {
                      this.refreshValues(instanceCheeseNFTFactory);
                      setInterval(() => {
                        this.refreshValues(instanceCheeseNFTFactory);
                    }, 5000);
                });
            }
            else {
              this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled, isMetaMask });
            }
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

    refreshValues = (instanceCheeseNFTFactory) => {
        if (instanceCheeseNFTFactory) {
          console.log('refreshValues of instanceCheeseNFTFactory');
        }
    }

    render()  {
        return (
            <div className={styles.left}>
                <Grid container style={{ marginTop: 20 }}>
                    <Grid item xs={10}>
                        <Card width={"420px"} 
                              maxWidth={"420px"} 
                              mx={"auto"} 
                              my={5} 
                              p={20} 
                              borderColor={"#E8E8E8"}
                        >
                            <h2>Publish and Put on Sale</h2>
                            <p>Please upload your cheese and put on sale from here!</p>

                            <Form onSubmit={this.onSubmit}>
                                <Field label="Cheese NFT Name">
                                    <Input
                                        type="text"
                                        width={1}
                                        placeholder="e.g) Art NFT Token"
                                        required={true}
                                        value={this.state.valueNFTName} 
                                        onChange={this.handleNFTName} 
                                    />
                                </Field> 

                                {/*
                                <Field label="Cheese NFT Symbol">
                                    <Input
                                        type="text"
                                        width={1}
                                        placeholder="e.g) ARNT"
                                        required={true}
                                        value={this.state.valueNFTSymbol} 
                                        onChange={this.handleNFTSymbol}                                        
                                    />
                                </Field>
                                */}

                                <Field label="Cheese Price (unit: ETH)">
                                    <Input
                                        type="text"
                                        width={1}
                                        placeholder="e.g) 10"
                                        required={true}
                                        value={this.state.valueCheesePrice} 
                                        onChange={this.handleCheesePrice}                                        
                                    />
                                </Field>

                                <Field label="Cheese for uploading to IPFS">
                                    <input 
                                        type='file' 
                                        onChange={this.captureFile} 
                                        required={true}
                                    />
                                </Field>

                                <Button size={'medium'} width={1} type='submit'>Upload my cheese and put on sale</Button>
                            </Form>
                        </Card>
                    </Grid>

                    <Grid item xs={1}>
                    </Grid>

                    <Grid item xs={1}>
                    </Grid>
                </Grid>
            </div>
        );
    }
}
