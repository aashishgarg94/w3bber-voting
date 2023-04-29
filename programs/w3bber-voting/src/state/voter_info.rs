use anchor_lang::prelude::*;
use num_derive::*;
use num_traits::*;

#[account]
pub struct VoterInfo {
    pub voter_id: Pubkey, // 32
    pub bump: u8 // 1
}

impl VoterInfo{
    pub const MAXIMUM_SIZE: usize = 32 + 1;
    
    pub fn create(&mut self, voter_id: Pubkey, bump: u8) -> Result<()> {
        self.voter_id = voter_id;
        self.bump = bump;
        Ok(())
    }
}   