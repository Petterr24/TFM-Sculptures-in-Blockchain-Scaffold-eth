const express = require('express')
const https = require('https')
const fs = require('fs');
const { spawnSync } = require('child_process');
//const processStatus = document.getElementById("processStatus");
const PORT = 5000

var app = express()

app.use(express.urlencoded({ extended: true })) // Needed to retrieve html form fields (it's a requirement of the local strategy)

app.post('/provideContractAddresses', async (req, res) => {
    const { UserAuthorisationAddress, SculptureFactoryAddress } = req.body;

    // Update the contract addresses in the json files
    const hardhatContractsPath = path.join(__dirname, ".packages/react-app/src/contracts/hardhat_contracts.json")

    if (!fs.existsSync(hardhatContractsPath)) {
        res.status(500).send('Before updating addresses, you shall deploy the SmartContracts in your machine');
        //processStatus.textContent = 'Before updating addresses, you shall deploy the SmartContracts in your machine'
        return
    }

    console.log(`Hardhat path ${hardhat_contracts}`)
    const hardhatContractsJson = SON.parse(fs.readFileSync(hardhatContractsPath, "utf-8"))
    // 31337 is the localChain, this should be modified to the Testnet
    // Update the addresses
    hardhatContractsJson['31337'][0]['contracts']['UserAuthorisation']['address'] = UserAuthorisationAddress;
    hardhatContractsJson['31337'][0]['contracts']['SculptureFactory']['address'] = SculptureFactoryAddress;

    // Write the updated JSON back to the file
    fs.writeFile(hardhatContractsPath, JSON.stringify(hardhatContractsJson, null, 2), err => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating contract addresses');
            //processStatus.textContent = 'Error updating contract addresses'
            return;
        }

        //processStatus.textContent = 'Contract addresses updated successfully'
        res.status(200).send('Contract addresses updated successfully');
    })
})

app.get('/home', (req, res) => {
    res.sendFile('./packages/home-page/home.html', { root: __dirname })
})

app.post('/handleDeploy', async (req, res) => {
    const chainResult = spawnSync('yarn', ['chain']);
    if (chainResult.status === 0) {
        console.log('Chain started successfully');
    } else {
        console.error(`Chain error: ${chainResult.stderr.toString()}`);
        res.status(500).send('Server error');
        return;
    }

    const deployResult = spawnSync('yarn', ['deploy']);
    if (deployResult.status === 0) {
        console.log('Smart contracts deployed successfully');
    } else {
        console.error(`Deploy error: ${deployResult.stderr.toString()}`);
        res.status(500).send('Server error');
        return;
    }

    res.status(200).send('Deploy completed successfully');
})

app.post('/startUI'), async (req, res) => {
    const result = spawnSync('yarn', ['start']);
    if (result.status === 0) {
        console.log('UI started successfully');
        res.status(200).send('UI started successfully');
    } else {
        console.error(`UI error: ${result.stderr.toString()}`);
        res.status(500).send('Server error');
    }
}

// Handlers must be called after all other middleware (app.use)
// and all routing
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
