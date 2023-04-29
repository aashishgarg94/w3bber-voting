import * as anchor from "@project-serum/anchor";
import { Program, AnchorError, web3 } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js'
import { Voting } from "../target/types/voting";

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

    //// Try to reinitialize in the wrong way
//     try{
//         await program.methods
//         .createUserData(random_user.publicKey, new_content.publicKey)
//         .accounts({
//           userData: userDataKeypair.publicKey,
//           user: user.publicKey,
//         })
//         .signers([userDataKeypair])
//         .rpc();
        
//         chai.assert(false, "Expected an error here!");
//     }catch(e) {
//         const errMsg = "An Error Occured";
//         chai.assert(true, e.toString());
//     }
    
//     //// Update in the right manner
//     await program.methods
//         .updateUserData(random_user.publicKey, new_content.publicKey)
//         .accounts({
//           userData: userDataKeypair.publicKey,
//           user: user.publicKey,
//         })
//         .signers([]) // Don't need to sign when we're not creating the account
//         .rpc();

//     let user_data_2 = await program.account.userData.fetch(userDataKeypair.publicKey);
//     expect(user_data_2.userId.toString()).to.equal(random_user.publicKey.toString());
//     expect(user_data_2.contentId.toString()).to.equal(new_content.publicKey.toString());
   })
});