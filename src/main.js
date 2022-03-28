const {BlockChain,Transaction}=require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('8aa1a0e2d84a157a7cb11ae8264e781efb6581a2102e7fb6fea91da8d3f5c04b');
const myWalletAdress = myKey.getPublic('hex');

let chatoorcoin =new BlockChain();

const tx1 = new Transaction(myWalletAdress, 'public key goes here',10);
tx1.signTransaction(myKey);
chatoorcoin.addTransaction(tx1);



console.log('\n Starting the miner ...');
chatoorcoin.minePendingTransactions(myWalletAdress);

console.log('\nBalance of Ala is ', chatoorcoin.getBalanceOfAdress(myWalletAdress));

