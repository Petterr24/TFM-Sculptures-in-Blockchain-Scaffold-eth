const express = require('express');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const path = require('path');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.post('/provideContractAddresses', async (req, res) => {
  const { UserAuthorisationAddress, SculptureFactoryAddress } = req.body;

  // Update the contract addresses in the json files
  const hardhatContractsPath = path.join(__dirname, "packages/react-app/src/contracts/hardhat_contracts.json");
  console.log(`Hardhat path ${hardhatContractsPath}`);
  if (!fs.existsSync(hardhatContractsPath)) {
    res.status(500).send('Before updating addresses, you shall deploy the SmartContracts in your machine');
    return;
  }

  const hardhatContractsJson = JSON.parse(fs.readFileSync(hardhatContractsPath, "utf-8"));
  hardhatContractsJson['31337'][0]['contracts']['UserAuthorisation']['address'] = UserAuthorisationAddress;
  hardhatContractsJson['31337'][0]['contracts']['SculptureFactory']['address'] = SculptureFactoryAddress;

  fs.writeFile(hardhatContractsPath, JSON.stringify(hardhatContractsJson, null, 2), err => {
    if (err) {
      console.error(err);
      res.status(500).send('Error updating contract addresses');
      return;
    }

    console.log('Contract addresses updated successfully');
    res.send('Contract addresses updated successfully');
  });
});

app.get('/home', (req, res) => {
  res.sendFile('./packages/home-page/home_v2.jsx', { root: __dirname });
});

app.post('/startLocalChain', async (req, res) => {
  exec(`gnome-terminal -- bash -c "yarn chain; exec bash"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send('Server error');
      return;
    }

    console.log("Starting local chain...");
    res.send('Local chain started successfully');
  });
});

app.post('/deploy', async (req, res) => {
  exec("yarn deploy", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send('Server error');
      return;
    }

    console.log('Smart contracts deployed successfully');
    res.send('Smart contracts deployed successfully');
  });
});

app.post('/startUI', async (req, res) => {
  exec(`gnome-terminal -- bash -c "yarn start; exec bash"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      res.status(500).send('Server error');
      return;
    }
  });

  console.log('Starting the SCs UI..');
  res.send('SCs UI started successfully');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = 5000;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}/home`;
  console.log(`Server running on port ${PORT}`);
  spawn('open', [url]);
});
