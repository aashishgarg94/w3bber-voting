use anchor_lang::prelude::*;
use num_derive::*;
use num_traits::*;

#[account]
pub struct VoterPollDataInfo {
    pub voter_id: Pubkey,
    pub poll_id: Pubkey,
}

impl VoterPollDataInfo{
    pub const MAXIMUM_SIZE: usize = 32 + 32;
    
    pub fn update(&mut self, voter_id: Pubkey, poll_id: Pubkey) -> Result<()> {
        self.voter_id = voter_id;
        self.poll_id = poll_id;
        Ok(())
    }
}