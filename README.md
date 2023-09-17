# TFM-Sculptures-in-Blockchain-Scaffold-eth
TFM-Sculptures-in-Blockchain-Scaffold-eth

## Environment requirements
- TFM-Sculptures-in-Blockchain-Scaffold-eth repository
- Node version: v18.10.0
- GNOME Terminal 3.48.1 using VTE 0.72.2 +BIDI +GNUTLS +ICU +SYSTEMD
- npm version 9.2.0
- yarn version 1.22.19
- hardhat

## Environment setup

Clone this repository in your mahcine: 
```
┌──(kali㉿kali)-[~]
└─$ git clone https://github.com/Petterr24/TFM-Sculptures-in-Blockchain-Scaffold-eth
```

Additional packages are needed, in case of having an issue when updating the Linux OS you maybe need to run this command:
```
sudo apt-key adv --refresh-keys --keyserver keyserver.ubuntu.com
````

Apart from that, you should run:
```
┌──(kali㉿kali)-[~]
└─$ sudo apt-get update
```

Annd you could also upgrade your machine:
```
┌──(kali㉿kali)-[~]
└─$ sudo apt-get upgrade
```

Then, you need to install **gnome-terminal** and **express** in the root directory:
```
┌──(kali㉿kali)-[~]
└─$ sudo apt-get install gnome-terminal
```
```
┌──(kali㉿kali)-[~]
└─$ npm install express
```

Once *gnome-terminal* and *express* have been installed, you need to move to the TFM-Sculptures-in-Blockchain-Scaffold-eth directory and there execute the following commands:
```
┌──(kali㉿kali)-[~/TFM-Sculptures-in-Blockchain-Scaffold-eth]
└─$ npm install --global yarn
```
```
┌──(kali㉿kali)-[~/TFM-Sculptures-in-Blockchain-Scaffold-eth]
└─$ yarn install
```
```
┌──(kali㉿kali)-[~/TFM-Sculptures-in-Blockchain-Scaffold-eth]
└─$ yarn global add nx
```
```
┌──(kali㉿kali)-[~/TFM-Sculptures-in-Blockchain-Scaffold-eth]
└─$ npm install --global hardhat
```

## Configuration setup for Goerli TestNet

You need to create different accounts to be able to run this Application on the Goerli TestNet. For each platform, you need to obtain an API key so you shall add their values into the corresponding .env files.
There are two different .env files, one is for hardhat and the other is for react-app:

- **packages/hardhat/.env**: used to deploy the SCs. Fields to be filled are (for instance):

```
GOERLI_INFURA_KEY=bc176..
GOERLI_DEPLOYER_PRIV_KEY=816a..
```

- **packages/react-app/.env**: used to interact the Scaffold UI with the Blockchain system.

```
# RPC keys
REACT_APP_INFURA_KEY=bc176.
REACT_APP_ALCHEMY_KEY=TGI_8..

# Etherscan API key(s)
REACT_APP_ETHERSCAN_API_KEY=TWQ3..

# Blocknative Dapp ID
REACT_APP_BLOCKNATIVE_DAPP_ID=b9ad-7..
```

The following websites are where you need to create an account to obtain the requested API Keys:

- **METAMASK**: https://metamask.io/:
    - It is used to create a wallet. Once a wallet is created, you need to obtain the Private key associated to that Wallet in order to complete the following field.
        - **GOERLI_DEPLOYER_PRIV_KEY**: *Please note that this Private key is used for hardhat environment, it means that this key will be the one used to deploy the Smart Contracts; if you want to deploy new Smart Contracts with another wallet account then you need to change this value by using the new account.*
- **INFURA**: https://app.infura.io/login
    - Infura API keys provide easy access to the Ethereum network, and enable us to supply the data and connections that matter to you. The same Infura API Key shall be added to both .env files:
        - **GOERLI_INFURA_KEY**
        - **REACT_APP_INFURA_KEY**
- **ALCHEMY**: https://www.alchemy.com/
    - Alchemy is the leading blockchain API. It can be used on popular blockchains such as Ethereum to do common operations like consult gas price, get blocks and send transactions.
        - **REACT_APP_ALCHEMY_KEY**
- **ETHERSCAN**: https://etherscan.io/login?cmd=last
    - The Etherscan API keyis used to authenticate and authorize access to the Etherscan API services. Etherscan is a popular block explorer and analytics platform for Ethereum and Ethereum-based blockchains.
        - **REACT_APP_ETHERSCAN_API_KEY**
- **BLOCKNATIVE**: https://explorer.blocknative.com/account
    - The BLOCKNATIVE API key, also known as the BLOCKNATIVE Dapp ID, is used for integrating and accessing services provided by Blocknative, a platform that offers tools and infrastructure for enhancing the user experience of decentralized applications (DApps) and blockchain interactions.
        - **REACT_APP_BLOCKNATIVE_DAPP_ID**

## Starts the User Interface
Run the following command to start the main User Interface
```
┌──(kali㉿kali)-[~/TFM-Sculptures-in-Blockchain-Scaffold-eth]
└─$ node index.js
```