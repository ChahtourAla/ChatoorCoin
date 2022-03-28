const SHA256= require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAdress, toAdress, amount){
        this.fromAdress=fromAdress;
        this.toAdress=toAdress;
        this.amount=amount;
    }
    claculateHash(){
        return SHA256(this.fromAdress,this.toAdress,this.amount);
    }
    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAdress){
            throw new Error('You cannot sign transactions for other wallets');
        }
        const hashTx = this.claculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }
    isValid(){
        if (this.fromAdress ===null) return true;
        if (!this.signature || this.signature.length === 0){
            throw new Error('No signature in this transaction');
        }
        const publicKey = ec.keyFromPublic(this.fromAdress, 'hex');
        return publicKey.verify(this.claculateHash(), this.signature);
    }
}
class Block {
    constructor (timestamp, transactions, previousHash=''){
        this.timestamp=timestamp;
        this.transactions=transactions;
        this.previousHash=previousHash;
        this.hash=this.claculateHash();
        this.nonce=0;
    }
    claculateHash(){
        return SHA256(this.index+this.previousHash+this.timestamp+JSON.stringify(this.data)+this.nonce).toString();
    }
    mineBlock(defficulty){
        while(this.hash.substring(0,defficulty) !== Array(defficulty+1).join("0")){
            this.nonce++;
            this.hash=this.claculateHash();
        }
        console.log('Block mined: '+ this.hash);
    }
    hasValidTransaction(){
        for (const tx of this.transactions){
            if (!tx.isValid()){
                return false ;
            }
        }
        return true;
    }
}
class BlockChain {
    constructor(){
        this.chain= [this.createGenesisBlock()];
        this.defficulty=2;
        this.pendingTransactions=[];
        this.minigRewards=100;
    }
    createGenesisBlock(){
        return new Block ("15/03/2022","GENESIS BLOCK","0");
    }
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }
    minePendingTransactions(miningReawrdAdress){
        const rewardTx = new Transaction(null, miningReawrdAdress, this.minigRewards);
        this.pendingTransactions.push(rewardTx);
        let block = new Block (Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.defficulty);
        console.log("Block successfully mined!");
        this.chain.push(block);
        this.pendingTransactions=[]; 
    }
    addTransaction(transaction){
        if(!transaction.fromAdress || !transaction.toAdress){
            throw new Error('Transaction must include from and to adress');
        }
        if(!transaction.isValid()){
            throw new Error('Cannot add invalid transaction to chain');
        }
        this.pendingTransactions.push(transaction);
    }
    getBalanceOfAdress(adress){
        let balance=0;
        for (const block of this.chain){
            for (const trans of block.transactions){
                if (trans.fromAdress === adress){
                    balance -= trans.amount;
                }
                if(trans.toAdress === adress){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }
    isChainValid(){
        for (let i=1;i < this.chain.length;i++){
            const currentBlock=this.chain[i];
            const previousBlock=this.chain[i-1];
            if (!currentBlock.hasValidTransaction()){
                return false;
            }
            if (currentBlock.hash!== currentBlock.claculateHash()){
                return false;
            }
            if (currentBlock.previousHash!== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

module.exports.BlockChain=BlockChain;
module.exports.Transaction=Transaction;