const express = require('express')
const fs = require('fs');
const { exec, spawn } = require('child_process');
const PORT = 5000
const path = require('path')
const reactNetworkConfigPath = path.join(__dirname, "packages/react-app/src/network_config.json");
const hardhatNetworkConfigPath = path.join(__dirname, "packages/hardhat/network_config.json");

var app = express()
let localChainInitiated = false;

app.use(express.urlencoded({ extended: true })) // Needed to retrieve html form fields (it's a requirement of the local strategy)

app.post('/provideContractAddresses', async (req, res) => {
    const { UserAuthorisationAddress, SculptureFactoryAddress } = req.body;
    const addressRegex = /^0x[0-9a-fA-F]{40}$/;

    if (!UserAuthorisationAddress || !SculptureFactoryAddress || !addressRegex.test(UserAuthorisationAddress) || !addressRegex.test(SculptureFactoryAddress)) {
        console.log('Error: Invalid Smart Contract address(es)');
        res.status(400).send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: red;"><strong>Invalid Smart Contract address(es)</strong></p>'
            + '<hr/><p>Please try again by selecting "Home-page" to go back to:</p>'
            + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');

        return;
    }

    // Check if the hardhatContractsPath exists before updating the contract addresses
    const hardhatContractsPath = path.join(__dirname, "packages/react-app/src/contracts/hardhat_contracts.json");
    if (!fs.existsSync(hardhatContractsPath)) {
        console.log('Error: Smart Contracts not deployed to be able to update the addresses');
        res.status(400).send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: red;"><strong>Before updating addresses, you shall deploy the SmartContracts in your machine</strong></p>'
            + '<hr/><p>Please try again by selecting "Home-page" to go back to:</p>'
            + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');

        return;
    }

    // Update the contract addresses in the json files
    const hardhatContractsJson = JSON.parse(fs.readFileSync(hardhatContractsPath, "utf-8"));
    const networkKeys = Object.keys(hardhatContractsJson);

    // Iterate through the network keys and update addresses
    for (const networkKey of networkKeys) {
        const contracts = hardhatContractsJson[networkKey][0].contracts;

        if (contracts.UserAuthorisation) {
            contracts.UserAuthorisation.address = UserAuthorisationAddress;
        }

        if (contracts.SculptureFactory) {
            contracts.SculptureFactory.address = SculptureFactoryAddress;
        }
    }

    // Write the updated JSON back to the file
    fs.writeFile(hardhatContractsPath, JSON.stringify(hardhatContractsJson, null, 2), err => {
        if (err) {
            console.log('Error: Error when updating JSON');
            console.error(err);
            res.status(500).send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: red;"><strong>Error when updating contract addresses</strong></p>'
                + '<hr/><p>Please try again by selecting "Home-page" to go back to:</p>'
                + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');

            return;
        }

        res.send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: green;"><strong>Contract addresses updated successfully </strong></p>'
            + '<hr/><p>Please select "Home-page" to go back to:</p>'
            + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');
    });
})

app.get('/home', (req, res) => {
    res.sendFile('./packages/home-page/home.html', { root: __dirname })
})

app.post('/startLocalChain', async (req, res) => {
    updateNetworkConfig("localhost");
    // Set the flag to true when the local chain is initiated
    localChainInitiated = true;

    exec(`gnome-terminal -- bash -c "yarn chain; exec bash"`, (error, stdout, stderr) => {
        if (error) {
            console.log('Error: Error when starting Local Chain');
            console.error(`exec error: ${error}`);
            res.status(500).send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: red;"><strong>Server error</strong></p>'
                + '<hr/><p>Please try again by selecting "Home-page" to go back to:</p>'
                + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');

            return;
        } else {
            res.redirect('/home'); // Redirect to the home page
        }
    })
})

app.post('/deploy', async (req, res) => {
    // Checks if the local chain has been initiated
    let network = req.body.selectedNetwork;
    if (network === "localhost" && !localChainInitiated) {
        console.log('Error: When starting UI because the local chain has not been started');
        res.status(400).send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: red;"><strong>Before starting the UI, you shall start the Local Chain</strong></p>'
            + '<hr/><p>Please try again by selecting "Home-page" to go back to:</p>'
            + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');

        return;
    }

    updateNetworkConfig(network);

    exec(`gnome-terminal -- bash -c "yarn deploy; exec bash"`, (error, stdout, stderr) => {
        if (error) {
            console.log('Error: When deploying SmartContracts.');
            console.error(`exec error: ${error}`);
            res.status(500).send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: red;"><strong>Server error. First run a local chain.</strong></p>'
                + '<hr/><p>Please try again by selecting "Home-page" to go back to:</p>'
                + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');

            return;
        } else {
            res.redirect('/home'); // Redirect to the home page
        }
    })
})

app.post('/startUI', async (req, res) => {
    // Checks if the local chain has been initiated
    let network = req.body.selectedNetwork;
    if (network === "localhost" && !localChainInitiated) {
        console.log('Error: When starting UI because the local chain has not been started');
        res.status(400).send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: red;"><strong>Before starting the UI, you shall start the Local Chain</strong></p>'
            + '<hr/><p>Please try again by selecting "Home-page" to go back to:</p>'
            + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');

        return;
    }

    updateNetworkConfig(network);

    // Check if the hardhatContractsPath exists before starting the UI
    const hardhatContractsPath = path.join(__dirname, "packages/react-app/src/contracts/hardhat_contracts.json");
    if (!fs.existsSync(hardhatContractsPath)) {
        console.log('Error: When starting UI');
        res.status(400).send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: red;"><strong>Before starting the UI, you shall deploy the SmartContracts in your machine</strong></p>'
            + '<hr/><p>Please try again by selecting "Home-page" to go back to:</p>'
            + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');

        return;
    }

    exec("yarn start", (error, stdout, stderr) => {
        if (error) {
            console.log('Error: When starting UI');
            console.error(`exec error: ${error}`);
            res.status(500).send('<div style="text-align: center; padding: 20px;"><p style="font-size: 20px; color: red;"><strong>Server error</strong></p>'
                + '<hr/><p>Please try again by selecting "Home-page" to go back to:</p>'
                + '<button type="button" onclick="location.href=\'/home\'" style="font-size: 24px; background-color: blue; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Home Page</button></div>');

            return;
        } else {
            res.redirect('/home'); // Redirect to the home page
        }
    })
})

function updateNetworkConfig(network) {
  try {
    // Parse the network config files
    const reactNetworkConfigJSON = JSON.parse(fs.readFileSync(reactNetworkConfigPath, "utf-8"));
    const hardhatNetworkConfigJSON = JSON.parse(fs.readFileSync(hardhatNetworkConfigPath, "utf-8"));

    reactNetworkConfigJSON.network = network;
    hardhatNetworkConfigJSON.network = network;

    // Write the updated data back to the file
    fs.writeFileSync(reactNetworkConfigPath, JSON.stringify(reactNetworkConfigJSON, null, 2));
    fs.writeFileSync(hardhatNetworkConfigPath, JSON.stringify(hardhatNetworkConfigJSON, null, 2));

    return true;
  } catch (error) {
    console.error('Error updating JSON file:', error);
    return false;
  }
}

// Handlers must be called after all other middleware (app.use)
// and all routing
app.use(function (err, req, res, next) {
    console.error(err.stack)
     res.status(500).send('Something broke!')
})

app.listen(PORT, () => {
    const url = `http://localhost:${PORT}/home`;
    console.log(`Server running on port ${PORT}`);
    spawn('open', [url]);
});
