const fs = require('fs');
const path = require('path');

const unzipper = require('unzipper');
const rmdir = require('rimraf');
const express = require('express');

const { Octokit } = require('@octokit/core');
const { Duplex } = require('stream');
const { program } = require('commander');

require('dotenv').config();

program
  .option('-o, --owner <string>', 'Owner, EX: https://github.com/nodejs/node Owner is nodejs')
  .option('-r, --repo <string>', 'Repository, EX: https://github.com/nodejs/node Repository is node')
  .option('-t, --token <string>', 'Personal Access Tokens See https://github.com/settings/tokens')
  .option('-c, --runonce', 'Run Once', false)
  .option('-p, --port <number>', 'Listen Port', 3000)
  .option('-d, --delay <number>', 'Seconds Delay To Launch Download', 5);

program.parse(process.argv);

console.log(
  '  _____ _ _   _           _                     _   _  __           _   \n' +
    ' / ____(_) | | |         | |         /\\        | | (_)/ _|         | |  \n' +
    '| |  __ _| |_| |__  _   _| |__      /  \\   _ __| |_ _| |_ __ _  ___| |_ \n' +
    "| | |_ | | __| '_ \\| | | | '_ \\    / /\\ \\ | '__| __| |  _/ _` |/ __| __|\n" +
    '| |__| | | |_| | | | |_| | |_) |  / ____ \\| |  | |_| | || (_| | (__| |_ \n' +
    ' \\_____|_|\\__|_| |_|\\__,_|_.__/  /_/    \\_\\_|   \\__|_|_| \\__,_|\\___|\\__|\n' +
    ' _____                      _                 _                         \n' +
    '|  __ \\                    | |               | |                        \n' +
    '| |  | | _____      ___ __ | | ___   __ _  __| | ___ _ __               \n' +
    "| |  | |/ _ \\ \\ /\\ / / '_ \\| |/ _ \\ / _` |/ _` |/ _ \\ '__|              \n" +
    '| |__| | (_) \\ V  V /| | | | | (_) | (_| | (_| |  __/ |                 \n' +
    '|_____/ \\___/ \\_/\\_/ |_| |_|_|\\___/ \\__,_|\\__,_|\\___|_|                 '
);

if (!program.owner) program.owner = process.env.GAD_Owner;
if (!program.repo) program.repo = process.env.GAD_Repo;
if (!program.token) program.token = process.env.GAD_Token;
if (process.env.GAD_Runonce) program.runonce = process.env.GAD_Runonce;
if (process.env.GAD_Port) program.port = process.env.GAD_Port;
if (process.env.GAD_Delay) program.delay = process.env.GAD_Delay;

if (!program.owner || !program.repo || !program.token) {
  console.log('\nMiss Options');
  console.log(program.opts());
  console.log(`\n${program.helpInformation()}`);
  console.log('Or Use .env file to set Options\n\nGAD_Owner=YourOwner\nGAD_Repo=YourRepository\nGAD_Token=YourToken\nGAD_Runonce=true\nGAD_Port=3000\nGAD_Delay=5\n');
  return;
}

const dist = './dist';

const octokit = new Octokit({ auth: program.token });

function sleep() {
  return new Promise((resolve) => setTimeout(resolve, program.delay * 1000));
}

async function DownloadArtifact() {
  if (program.runonce !== 'true' && program.delay > 0) {
    console.log(`Delay ${program.delay} Second(s)...`);
    await sleep();
  }

  console.log('Downloading...');

  fs.readdir(dist, (err, files) => {
    for (const file of files) rmdir(path.join(dist, file), () => {});
  });

  const artifacts = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts?per_page=1', {
    owner: program.owner,
    repo: program.repo,
  });

  const zip = await octokit.request('GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}', {
    owner: program.owner,
    repo: program.repo,
    artifact_id: artifacts.data.artifacts[0].id,
    archive_format: 'zip',
  });

  const stream = new Duplex();
  stream.push(Buffer.from(zip.data));
  stream.push(null);
  stream.pipe(unzipper.Extract({ path: dist }));

  console.log('Done!');
}

if (program.runonce === 'true' || program.runonce === true) {
  console.log('Run Once!');
  DownloadArtifact();
  return;
}

const app = express();
app.get('/', (req, res) => res.send(`Use as follows command to launch download<br><br>curl -X POST -H "authorization: token &lt;Replace With Your Toke&gt;" http://localhost:${program.port}`));
app.post('/', (req, res) => {
  if (req.headers['authorization'] !== `token ${program.token}`) {
    res.send(`Use as follows command to launch download<br><br>curl -X POST -H "authorization: token &lt;Replace With Your Toke&gt;" http://localhost:${program.port}`);
    return;
  }
  DownloadArtifact();
  res.send('Downloader Launched!');
});
app.listen(program.port, () => {
  console.log(`Listening on port ${program.port}...`);
  console.log(`\nUse as follows command to launch download\n\ncurl -X POST -H "authorization: token <Replace With Your Toke>" http://localhost:${program.port}`);
});
