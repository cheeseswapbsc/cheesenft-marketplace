import React, { Component } from "react";
import { PublicAddress, Blockie } from 'rimble-ui';
import styles from './Web3Info.module.scss';

export default class Web3Info extends Component {

  renderNetworkName(networkId) {
    switch (networkId) {
      case 3:
        return 'Ropsten';
      case 4:
        return 'Rinkeby';
      case 56:
        return 'BSC';
      case 42:
        return 'Kovan';
      default:
        return 'Private';
    }
  }

  render()  {
    const { networkId, accounts, balance, isMetaMask } = this.props;
    return (
      <div className={styles.web3}>
        <h3> Your Network Info </h3>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Network:
          </div>
          <div className={styles.value}>
            {networkId} - {this.renderNetworkName(networkId)}
          </div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Your address:
          </div>
          <div className={styles.value}>
            <PublicAddress address={accounts[0]}/>
            <Blockie
              opts={{seed: accounts[0], size: 15, scale: 3}} />
          </div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Your BNB balance:
          </div>
          <div className={styles.value}>
            {balance}
          </div>
        </div>
        <div className={styles.dataPoint}>
          <div className={styles.label}>
            Using Metamask:
          </div>
          <div className={styles.value}>
            {isMetaMask ? 'YES' : 'NO'}
          </div>
        </div>
      </div>
    );
  }
}
