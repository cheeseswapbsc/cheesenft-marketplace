import React from 'react';
import styles from './header.module.scss';
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";


const Header = () => (
    <div className={styles.header}>
        <nav id="menu" className="menu">
          <ul>
            <li><a href="/" className={styles.link}><span style={{ padding: "60px" }}></span></a></li>

            <li><a href="/publish" className={styles.link}> Create</a></li>

            <li><a href="/my-cheeses" className={styles.link}> My Cheeses</a></li>

            {process.env.NODE_ENV !== 'cheese_marketplace' && (
              <li><a href="/cheese-marketplace" className={styles.link}> Cheese MarketPlace</a></li>
            )}
          </ul>
        </nav>
    </div>
)

export default Header;
