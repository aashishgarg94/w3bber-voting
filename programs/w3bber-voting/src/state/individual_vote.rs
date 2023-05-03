use anchor_lang::prelude::*;
use crate::state::error_code::*;
use num_derive::*;
use num_traits::*;

#[account]
pub struct IndividualVote {
    pub poll_id: Pubkey, // 32
    pub voter_id: Pubkey, // 32
    pub vote: String, // 260
    pub tokens_staked: u32, // 4
    pub bump: u8, // 1
}

impl IndividualVote{
    pub const MAXIMUM_SIZE: usize = 260 + 32 + 32 + 4 + 1;

    pub fn create(&mut self, poll_id: Pubkey, voter_id: Pubkey, vote: String, tokens_staked: u32, bump: u8) -> Result<()> {
        if vote.len() > 260 {
            return Err(ErrorsCode::VoteTooLong.into());
        }
        self.poll_id = poll_id;
        self.voter_id = voter_id;
        self.vote = vote;
        self.tokens_staked = tokens_staked;
        self.bump = bump;
        Ok(())
    }

    pub fn update(&mut self, vote: String, tokens_staked: u32) -> Result<()> {
        assert!(vote.len() <= 260);
        self.vote = vote;
        self.tokens_staked = tokens_staked;
        Ok(())
    }
}