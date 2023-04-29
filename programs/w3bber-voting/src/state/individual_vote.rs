use anchor_lang::prelude::*;
use num_derive::*;
use num_traits::*;

#[account]
pub struct IndividualVote {
    poll_id: Pubkey, // 32
    voter_id: Pubkey, // 32
    pub vote: String, // 130
    pub tokens_staked: u32, // 4
    pub bump: u8, // 1
}

impl IndividualVote{
    pub const MAXIMUM_SIZE: usize = 130 + 32 + 32 + 4 + 1;

    pub fn create(&mut self, poll_id: Pubkey, voter_id: Pubkey, vote: String, tokens_staked: u32) -> Result<()> {
        assert!(vote.len() <= 130);
        self.poll_id = poll_id;
        self.voter_id = voter_id;
        self.vote = vote;
        self.tokens_staked = tokens_staked;
        Ok(())
    }

    pub fn update(&mut self, vote: String, tokens_staked: u32) -> Result<()> {
        assert!(vote.len() <= 130);
        self.vote = vote;
        self.tokens_staked = tokens_staked;
        Ok(())
    }
}