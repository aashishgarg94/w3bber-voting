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

  it("Poll Data", async () => {
    const pollDataKeypair = anchor.web3.Keypair.generate();
    const kp = JSON.stringify(pollDataKeypair)
    const stored_kp = JSON.parse(kp)
    const arr = Object.values(stored_kp["_keypair"]["secretKey"])
    const secret = new Uint8Array(arr)
    const pair = web3.Keypair.fromSecretKey(secret)

    const random_poll = anchor.web3.Keypair.generate();
    const new_poll = anchor.web3.Keypair.generate();
    
    const user = (program.provider as anchor.AnchorProvider).wallet;
    
    //// Create Poll data
    await program.methods
      .createPollData(random_poll.publicKey)
      .accounts({
        pollDataAccount: pollDataKeypair.publicKey,
        user: user.publicKey,
      })
      .signers([pollDataKeypair])
      .rpc()

    // Check contents of Poll Data
    let poll_data_info = await program.account.pollDataInfo.fetch(pollDataKeypair.publicKey);
    expect(poll_data_info.pollId.toString()).to.equal(random_poll.publicKey.toString());

    // Try to reinitialize in the wrong way
    try{
        await program.methods
        .createPollData(new_poll.publicKey)
        .accounts({
            pollDataAccount: pollDataKeypair.publicKey,
            user: user.publicKey,
        })
        .signers([pollDataKeypair])
        .rpc();
        
        chai.assert(false, "Expected an error here!");
    }catch(e) {
        const errMsg = "An Error Occured";
        chai.assert(true, e.toString());
    }
    
    //// Update in the right manner
    await program.methods
        .updatePollData(new_poll.publicKey)
        .accounts({
          pollDataAccount: pollDataKeypair.publicKey,
          user: user.publicKey,
        })
        .signers([]) // Don't need to sign when we're not creating the account
        .rpc();

    let poll_data_info_2 = await program.account.pollDataInfo.fetch(pollDataKeypair.publicKey);
    expect(poll_data_info_2.pollId.toString()).to.equal(new_poll.publicKey.toString());
  })

  it("Poll Data Different User", async () => {
    const pollDataKeypair = anchor.web3.Keypair.generate();
    const pollDataKeypair2 = anchor.web3.Keypair.generate();
    const kp = JSON.stringify(pollDataKeypair)
    const stored_kp = JSON.parse(kp)
    const arr = Object.values(stored_kp["_keypair"]["secretKey"])


    const random_poll = anchor.web3.Keypair.generate();
    const new_poll = anchor.web3.Keypair.generate();
    
    const user = (program.provider as anchor.AnchorProvider).wallet;

    //// Create Poll data
    await program.methods
      .createPollData(random_poll.publicKey)
      .accounts({
        pollDataAccount: pollDataKeypair.publicKey,
        user: user.publicKey,
      })
      .signers([pollDataKeypair])
      .rpc()

    // Check contents of Poll Data
    let poll_data_info = await program.account.pollDataInfo.fetch(pollDataKeypair.publicKey);
    expect(poll_data_info.pollId.toString()).to.equal(random_poll.publicKey.toString());

    // Try to create with a different wallet
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

        await program_2.methods
        .createPollData(new_poll.publicKey)
        .accounts({
            pollDataAccount: pollDataKeypair2.publicKey,
            user: wallet_pair.publicKey,
        })
        .signers([pollDataKeypair2])
        .rpc();

        let poll_data_info_2 = await program.account.pollDataInfo.fetch(pollDataKeypair2.publicKey);
        expect(poll_data_info_2.pollId.toString()).to.equal(new_poll.publicKey.toString());

    // Try to update with different pubkey
    try{
        await program.methods
        .updatePollData(new_poll.publicKey)
        .accounts({
            pollDataAccount: pollDataKeypair.publicKey,
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

  it("Poll Account", async () => {
    const pollDataKeypair = anchor.web3.Keypair.generate();
    const random_poll = anchor.web3.Keypair.generate();
    const new_poll = anchor.web3.Keypair.generate();

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const twoDaysInSeconds = 2 * 24 * 60 * 60;
    const timestampPlusTwoDays = currentTimestamp + twoDaysInSeconds;
    const timestampPlusTwoDaysAsI32 = timestampPlusTwoDays | 0;
    const started_keys = ["started"]
    const finished_keys = ["finished"]
    const cancelled_keys = ["cancelled"]
    const poll_result = 80
    const changed_poll_result = 81

    const user = (program.provider as anchor.AnchorProvider).wallet;
    
    //// Create Poll data
    await program.methods
      .createPollData(random_poll.publicKey)
      .accounts({
        pollDataAccount: pollDataKeypair.publicKey,
        user: user.publicKey,
      })
      .signers([pollDataKeypair])
      .rpc()
    
    let poll_data = await program.account.pollDataInfo.fetch(pollDataKeypair.publicKey);

    const [pollInfoPDA, _] = PublicKey.findProgramAddressSync(
      [
        poll_data.pollId.toBuffer()
      ],
      program.programId
    )
    
    //// Create Poll Info
    await program.methods
      .createPoll(timestampPlusTwoDaysAsI32)
      .accounts({
        pollAccount: pollInfoPDA,
        pollDataAccount: pollDataKeypair.publicKey,
        user: user.publicKey,
      })
      .rpc()

    //// Try to reinitialize in the wrong way
    try{
      await program.methods
      .createPoll(timestampPlusTwoDaysAsI32)
      .accounts({
        pollDataAccount: pollDataKeypair.publicKey,
        user: user.publicKey,
      })
      .rpc();
      
      chai.assert(false, "Expected an error here!");
    }catch(e) {
        const errMsg = "An Error Occured";
        chai.assert(true, e.toString());
    }

    // check content of poll_info
    let poll_info = await program.account.pollInfo.fetch(pollInfoPDA);
    expect(poll_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
    expect(poll_info.votingDeadline).to.equal(timestampPlusTwoDaysAsI32);
    expect(poll_info.user.toString()).to.equal(user.publicKey.toString());
    expect(Object.keys(poll_info.status) == started_keys);
    expect(poll_info.result == null)

    //// Reveal Poll By Non-Owner
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

    try{
        await program_2.methods
        .revealPoll(poll_result)
        .accounts({
            pollAccount: pollInfoPDA,
            user: wallet_pair.publicKey,
        })
        .rpc()

        poll_info = await program.account.pollInfo.fetch(pollInfoPDA);
        expect(poll_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
        expect(poll_info.votingDeadline).to.equal(timestampPlusTwoDaysAsI32);
        expect(poll_info.user.toString()).to.equal(user.publicKey.toString());
        expect(Object.keys(poll_info.status) == finished_keys);
        expect(poll_info.result == poll_result)
    }catch(e) {
        const errMsg = "ConstraintRaw";
        chai.assert(e["error"]["errorCode"]["code"] == errMsg, e.toString());
    }

    //// Reveal Poll
    await program.methods
      .revealPoll(poll_result)
      .accounts({
        pollAccount: pollInfoPDA,
        user: user.publicKey,
      })
      .rpc()

      poll_info = await program.account.pollInfo.fetch(pollInfoPDA);
      expect(poll_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
      expect(poll_info.votingDeadline).to.equal(timestampPlusTwoDaysAsI32);
      expect(poll_info.user.toString()).to.equal(user.publicKey.toString());
      expect(Object.keys(poll_info.status) == finished_keys);
      expect(poll_info.result == poll_result)

    //// Reveal Poll Again
    try{
        await program.methods
        .revealPoll(changed_poll_result)
        .accounts({
            pollAccount: pollInfoPDA,
            user: user.publicKey,
        })
        .rpc()

        poll_info = await program.account.pollInfo.fetch(pollInfoPDA);
        expect(poll_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
        expect(poll_info.votingDeadline).to.equal(timestampPlusTwoDaysAsI32);
        expect(poll_info.user.toString()).to.equal(user.publicKey.toString());
        expect(Object.keys(poll_info.status) == finished_keys);
        expect(poll_info.result == changed_poll_result)
    }catch(e) {
        const errMsg = "PollAlreadyFinished";
        chai.assert(e["error"]["errorCode"]["code"] == errMsg, e.toString());
    }

    //// Cancel Poll By Non-Owner
    try{
        await program_2.methods
        .cancelPoll()
        .accounts({
            pollAccount: pollInfoPDA,
            user: wallet_pair.publicKey,
        })
        .rpc()

        poll_info = await program.account.pollInfo.fetch(pollInfoPDA);
        expect(poll_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
        expect(poll_info.votingDeadline).to.equal(timestampPlusTwoDaysAsI32);
        expect(poll_info.user.toString()).to.equal(user.publicKey.toString());
        expect(Object.keys(poll_info.status) == cancelled_keys);
        expect(poll_info.result == null)
    }catch(e) {
        const errMsg = "ConstraintRaw";
        chai.assert(e["error"]["errorCode"]["code"] == errMsg, e.toString());
    }

    //// Cancel Poll
    await program.methods
      .cancelPoll()
      .accounts({
        pollAccount: pollInfoPDA,
        user: user.publicKey,
      })
      .rpc()

      poll_info = await program.account.pollInfo.fetch(pollInfoPDA);
      expect(poll_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
      expect(poll_info.votingDeadline).to.equal(timestampPlusTwoDaysAsI32);
      expect(poll_info.user.toString()).to.equal(user.publicKey.toString());
      expect(Object.keys(poll_info.status) == cancelled_keys);
      expect(poll_info.result == null)

    //// Reveal Poll Again
    try{
        await program.methods
        .revealPoll(changed_poll_result)
        .accounts({
            pollAccount: pollInfoPDA,
            user: user.publicKey,
        })
        .rpc()

        poll_info = await program.account.pollInfo.fetch(pollInfoPDA);
        expect(poll_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
        expect(poll_info.votingDeadline).to.equal(timestampPlusTwoDaysAsI32);
        expect(poll_info.user.toString()).to.equal(user.publicKey.toString());
        expect(Object.keys(poll_info.status) == finished_keys);
        expect(poll_info.result == changed_poll_result)
    }catch(e) {
        const errMsg = "PollAlreadyCancelled";
        chai.assert(e["error"]["errorCode"]["code"] == errMsg, e.toString());
    }

    //// Cancel Poll Again
    try{
        await program.methods
        .cancelPoll()
        .accounts({
            pollAccount: pollInfoPDA,
            user: user.publicKey,
        })
        .rpc()

        poll_info = await program.account.pollInfo.fetch(pollInfoPDA);
        expect(poll_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
        expect(poll_info.votingDeadline).to.equal(timestampPlusTwoDaysAsI32);
        expect(poll_info.user.toString()).to.equal(user.publicKey.toString());
        expect(Object.keys(poll_info.status) == finished_keys);
        expect(poll_info.result == changed_poll_result)
    }catch(e) {
        const errMsg = "PollAlreadyCancelled";
        chai.assert(e["error"]["errorCode"]["code"] == errMsg, e.toString());
    }
  })

  it("Vote", async () => {
    const pollDataKeypair = anchor.web3.Keypair.generate();
    const random_poll = anchor.web3.Keypair.generate();
    const random_voter = anchor.web3.Keypair.generate();

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const twoDaysInSeconds = 2 * 24 * 60 * 60;
    const timestampPlusTwoDays = currentTimestamp + twoDaysInSeconds;
    const timestampPlusTwoDaysAsI32 = timestampPlusTwoDays | 0;
    const started_keys = ["started"]
    const finished_keys = ["finished"]
    const cancelled_keys = ["cancelled"]
    const poll_result = 80
    const ciphertext = "669dea4f69dbc33e539db7b9bc3fc7a595a80e40e59f94b912c5d5c8a8ea8cd08a33624fcc5ef9e88dea2beca8d8c32c126e5d2a09d00dcd0f2c670068c2cdd5a9ae730a7c90f128c5e104b30c0cbdf308bf1fcdf221106822c0dd6d669146aad64807a2e1968593d3b2459190c858784a6aff03fe24101ebddfcae64d4d8432"
    const new_ciphertext = "769dea4f69dbc33e539db7b9bc3fc7a595a80e40e59f94b912c5d5c8a8ea8cd08a33624fcc5ef9e88dea2beca8d8c32c126e5d2a09d00dcd0f2c670068c2cdd5a9ae730a7c90f128c5e104b30c0cbdf308bf1fcdf221106822c0dd6d669146aad64807a2e1968593d3b2459190c858784a6aff03fe24101ebddfcae64d4d8432"
    const long_ciphertext = ciphertext + ciphertext
    const tokens_staked = 1000
    const new_tokens_staked = 2000

    const user = (program.provider as anchor.AnchorProvider).wallet;

    //// Create Voter Info
    const [voterInfoPDA, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from("voter"), user.publicKey.toBuffer()],
        program.programId
    );

    await program.methods
        .createVoter()
        .accounts({
            voterAccount: voterInfoPDA,
            user: user.publicKey,
        })
        .signers([])
        .rpc()

    let voter_info = await program.account.voterInfo.fetch(voterInfoPDA);
    expect(voter_info.voterId.toString()).to.equal(user.publicKey.toString());

    //// Create Poll data
    await program.methods
      .createPollData(random_poll.publicKey)
      .accounts({
        pollDataAccount: pollDataKeypair.publicKey,
        user: user.publicKey,
      })
      .signers([pollDataKeypair])
      .rpc()
    
    let poll_data = await program.account.pollDataInfo.fetch(pollDataKeypair.publicKey);

    const [pollInfoPDA, _] = PublicKey.findProgramAddressSync(
      [
        poll_data.pollId.toBuffer()
      ],
      program.programId
    )
    
    //// Create Poll Info
    await program.methods
      .createPoll(timestampPlusTwoDaysAsI32)
      .accounts({
        pollAccount: pollInfoPDA,
        pollDataAccount: pollDataKeypair.publicKey,
        user: user.publicKey,
      })
      .rpc()

    // check content of poll_info
    let poll_info = await program.account.pollInfo.fetch(pollInfoPDA);
    expect(poll_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
    expect(poll_info.votingDeadline).to.equal(timestampPlusTwoDaysAsI32);
    expect(poll_info.user.toString()).to.equal(user.publicKey.toString());
    expect(Object.keys(poll_info.status) == started_keys);
    expect(poll_info.result == null)

    //// Create Vote
    const [voteInfoPDA, bump_vote] = PublicKey.findProgramAddressSync(
        [
            voter_info.voterId.toBuffer(),
            poll_info.pollId.toBuffer()
        ],
        program.programId
      )

    await program.methods
      .createVote(ciphertext, tokens_staked)
      .accounts({
        voterAccount: voterInfoPDA,
        pollAccount: pollInfoPDA,
        voteAccount: voteInfoPDA,
        user: user.publicKey,
      })
      .rpc()

    //// Try to reinitialize in the wrong way
    try{
      await program.methods
      .createVote(ciphertext, tokens_staked)
      .accounts({
        voterAccount: voterInfoPDA,
        pollAccount: pollInfoPDA,
        voteAccount: voteInfoPDA,
        user: user.publicKey,
      })
      .rpc();
      
      chai.assert(false, "Expected an error here!");
    }catch(e) {
        const errMsg = "An Error Occured";
        chai.assert(true, e.toString());
    }

    let vote_info = await program.account.individualVote.fetch(voteInfoPDA);
    expect(vote_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
    expect(vote_info.voterId.toString()).to.equal(user.publicKey.toString());
    expect(vote_info.vote.toString()).to.equal(ciphertext);
    expect(vote_info.tokensStaked).to.equal(tokens_staked);

    //// Update vote
    await program.methods
      .updateVote(new_ciphertext, new_tokens_staked)
      .accounts({
        voteAccount: voteInfoPDA,
        user: user.publicKey,
      })
      .rpc()

      let new_vote_info = await program.account.individualVote.fetch(voteInfoPDA);
      expect(new_vote_info.pollId.toString()).to.equal(random_poll.publicKey.toString());
      expect(new_vote_info.voterId.toString()).to.equal(user.publicKey.toString());
      expect(new_vote_info.vote.toString()).to.equal(new_ciphertext);
      expect(new_vote_info.tokensStaked).to.equal(new_tokens_staked);
  })
});