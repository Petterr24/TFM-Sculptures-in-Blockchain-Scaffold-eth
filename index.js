const express = require('express')
const https = require('https')
const fs = require('fs');
const { exec, spawn } = require('child_process');
//const processStatus = document.getElementById("processStatus");
const PORT = 5000
const path = require('path')

var app = express()

app.use(express.urlencoded({ extended: true })) // Needed to retrieve html form fields (it's a requirement of the local strategy)

app.post('/provideContractAddresses', async (req, res) => {
    const { UserAuthorisationAddress, SculptureFactoryAddress } = req.body;

    // Update the contract addresses in the json files
    const hardhatContractsPath = path.join(__dirname, "packages/react-app/src/contracts/hardhat_contracts.json")
    console.log(`Hardhat path ${hardhatContractsPath}`)
    if (!fs.existsSync(hardhatContractsPath)) {
        res.status(500).send('Before updating addresses, you shall deploy the SmartContracts in your machine');
        //processStatus.textContent = 'Before updating addresses, you shall deploy the SmartContracts in your machine'
        return
    }

    const hardhatContractsJson = JSON.parse(fs.readFileSync(hardhatContractsPath, "utf-8"))
    // 31337 is the localChain, this should be modified to the Testnet
    // Update the addresses
    hardhatContractsJson['31337'][0]['contracts']['UserAuthorisation']['address'] = UserAuthorisationAddress;
    hardhatContractsJson['31337'][0]['contracts']['SculptureFactory']['address'] = SculptureFactoryAddress;

    // Write the updated JSON back to the file
    fs.writeFile(hardhatContractsPath, JSON.stringify(hardhatContractsJson, null, 2), err => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating contract addresses')
            //processStatus.textContent = 'Error updating contract addresses'
            return;
        }

        //processStatus.textContent = 'Contract addresses updated successfully'
        console.log('Contract addresses updated successfully')
    })
})

app.get('/home', (req, res) => {
    res.sendFile('./packages/home-page/home.html', { root: __dirname })
})

app.post('/startLocalChain', async (req, res) => {
    exec(`gnome-terminal -- bash -c "yarn chain; exec bash"`, (error, stdout, stderr) => {
        //processStatus.textContent = 'Starting the chain..'
        if (error) {
          console.error(`exec error: ${error}`);
          res.status(500).send('Server error');
          return;
        }
 
        console.log("Starting local chain...")
        //processStatus.textContent = 'Chain started successfully'
    })
})

app.post('/deploy', async (req, res) => {
    exec("yarn deploy", (error, stdout, stderr) => {
        //processStatus.textContent = 'Deploying the SmartContracts..'
        if (error) {
            console.error(`exec error: ${error}`);
            res.status(500).send('Server error');
            return;
        }
        //processStatus.textContent = 'Smart contracts deployed successfully'
    })

    console.log('Deploying the Smart Contracts..');
})

app.post('/startUI', async (req, res) => {
    exec(`gnome-terminal -- bash -c "yarn start; exec bash"`, (error, stdout, stderr) => {
        //processStatus.textContent = 'Starting the UI..'
        if (error) {
          console.error(`exec error: ${error}`);
          res.status(500).send('Server error');
          return;
        }
    })
    console.log('Starting the SCs UI..');
})

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
