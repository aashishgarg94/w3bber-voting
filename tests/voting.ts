import * as anchor from "@project-serum/anchor";
import { Program, AnchorError, web3, Provider } from "@project-serum/anchor";
import { Voting } from "../target/types/voting";
import { Transaction, SystemProgram, Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, PublicKey } from "@solana/web3.js"

import chai from 'chai';
import { expect } from 'chai'

describe("w3bber-voting", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Voting as Program<Voting>;
  
  it("Voter Poll Data", async () => {
    const voterPollDataKeypair = anchor.web3.Keypair.generate();
    const kp = JSON.stringify(voterPollDataKeypair)
    const stored_kp = JSON.parse(kp)
    const arr = Object.values(stored_kp["_keypair"]["secretKey"])
    const secret = new Uint8Array(arr)
    const pair = web3.Keypair.fromSecretKey(secret)

    const random_voter = anchor.web3.Keypair.generate();
    const random_poll = anchor.web3.Keypair.generate();
    const new_poll = anchor.web3.Keypair.generate();
    
    const user = (program.provider as anchor.AnchorProvider).wallet;
    
    //// Create User data
    await program.methods
      .createVoterPollData(random_voter.publicKey, random_poll.publicKey)
      .accounts({
        voterPollDataAccount: voterPollDataKeypair.publicKey,
        user: user.publicKey,
      })
      .signers([voterPollDataKeypair])
      .rpc()

    // Check content of User Data
    let voter_poll_data_info = await program.account.voterPollDataInfo.fetch(voterPollDataKeypair.publicKey);
    expect(voter_poll_data_info.voterId.toString()).to.equal(random_voter.publicKey.toString());
    expect(voter_poll_data_info.pollId.toString()).to.equal(random_poll.publicKey.toString());

    // Try to reinitialize in the wrong way
    try{
        await program.methods
        .createVoterPollData(random_voter.publicKey, new_poll.publicKey)
        .accounts({
            voterPollDataAccount: voterPollDataKeypair.publicKey,
            user: user.publicKey,
        })
        .signers([voterPollDataKeypair])
        .rpc();
        
        chai.assert(false, "Expected an error here!");
    }catch(e) {
        const errMsg = "An Error Occured";
        chai.assert(true, e.toString());
    }
    
    //// Update in the right manner
    await program.methods
        .updateVoterPollData(random_voter.publicKey, new_poll.publicKey)
        .accounts({
          voterPollDataAccount: voterPollDataKeypair.publicKey,
          user: user.publicKey,
        })
        .signers([]) // Don't need to sign when we're not creating the account
        .rpc();

    let voter_poll_data_info_2 = await program.account.voterPollDataInfo.fetch(voterPollDataKeypair.publicKey);
    expect(voter_poll_data_info_2.voterId.toString()).to.equal(random_voter.publicKey.toString());
    expect(voter_poll_data_info_2.pollId.toString()).to.equal(new_poll.publicKey.toString());
   })


   it("Voter Poll Data Different User", async () => {
    const fs = require('fs');
    const filePath = "/Users/aashishgarg/wba/wba-pre-req/airdrop/dev-wallet.json"

    const readJsonFile = (filePath: string) => {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    };

    const wallet_data = readJsonFile(filePath);
    const wallet_secret = new Uint8Array(wallet_data)
    const wallet_pair = web3.Keypair.fromSecretKey(wallet_secret)
    const customWallet = {
        publicKey: wallet_pair.publicKey,
        signTransaction: async (transaction) => {
          transaction.partialSign(wallet_pair);
          return transaction;
        },
        signAllTransactions: async (transactions) => {
          transactions.forEach((transaction) => transaction.partialSign(wallet_pair));
          return transactions;
        },
      };
    const customProvider = new anchor.AnchorProvider(provider.connection, customWallet, provider.opts);
    const program_2 = new anchor.Program(program.idl, program.programId, customProvider);

    const voterPollDataKeypair = anchor.web3.Keypair.generate();
    const voterPollDataKeypair2 = anchor.web3.Keypair.generate();
    const kp = JSON.stringify(voterPollDataKeypair)
    const stored_kp = JSON.parse(kp)
    const arr = Object.values(stored_kp["_keypair"]["secretKey"])


    const random_voter = anchor.web3.Keypair.generate();
    const random_poll = anchor.web3.Keypair.generate();
    const new_poll = anchor.web3.Keypair.generate();
    
    const user = (program.provider as anchor.AnchorProvider).wallet;
    console.log("User: ", user.publicKey.toString(), "Wallet: ", wallet_pair.publicKey.toString(), "VoterPoll: ", voterPollDataKeypair.publicKey.toString())

    const txHash = await provider.connection.requestAirdrop(
        wallet_pair.publicKey,
        1000 * LAMPORTS_PER_SOL
    );

    const blockhashInfo = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: blockhashInfo.blockhash,
      lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
      signature: txHash,
    });

    //// Create User data
    await program.methods
      .createVoterPollData(random_voter.publicKey, random_poll.publicKey)
      .accounts({
        voterPollDataAccount: voterPollDataKeypair.publicKey,
        user: user.publicKey,
      })
      .signers([voterPollDataKeypair])
      .rpc()

    // Check content of User Data
    let voter_poll_data_info = await program.account.voterPollDataInfo.fetch(voterPollDataKeypair.publicKey);
    expect(voter_poll_data_info.voterId.toString()).to.equal(random_voter.publicKey.toString());
    expect(voter_poll_data_info.pollId.toString()).to.equal(random_poll.publicKey.toString());

    // Try to create with a different wallet
        await program_2.methods
        .createVoterPollData(random_voter.publicKey, new_poll.publicKey)
        .accounts({
            voterPollDataAccount: voterPollDataKeypair2.publicKey,
            user: wallet_pair.publicKey,
        })
        .signers([voterPollDataKeypair2])
        .rpc();

        let voter_poll_data_info_2 = await program.account.voterPollDataInfo.fetch(voterPollDataKeypair2.publicKey);
        expect(voter_poll_data_info_2.voterId.toString()).to.equal(random_voter.publicKey.toString());
        expect(voter_poll_data_info_2.pollId.toString()).to.equal(new_poll.publicKey.toString());

    // Try to update with different pubkey
    try{
        await program.methods
        .updateVoterPollData(random_voter.publicKey, new_poll.publicKey)
        .accounts({
            voterPollDataAccount: voterPollDataKeypair.publicKey,
            user: wallet_pair.publicKey,
        })
        .signers([])
        .rpc();
        
        chai.assert(false, "Expected an error here!");
    }catch(e) {
        const errMsg = "An Error Occured";
        chai.assert(true, e.toString());
    }
   })
});