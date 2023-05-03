use anchor_lang::prelude::*;
use num_derive::*;
use num_traits::*;

#[account]
pub struct PollDataInfo {
    pub poll_id: Pubkey,
}

impl PollDataInfo{
    pub const MAXIMUM_SIZE: usize = 32;
    
    pub fn update(&mut self, poll_id: Pubkey) -> Result<()> {
        self.poll_id = poll_id;
        Ok(())
    }
}