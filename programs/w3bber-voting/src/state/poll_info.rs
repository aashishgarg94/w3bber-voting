use anchor_lang::prelude::*;
use crate::state::error_code::*;
use num_derive::*;
use num_traits::*;

#[derive(Clone, Copy, Debug, PartialEq, AnchorSerialize, AnchorDeserialize, FromPrimitive)]
pub enum PollStatus {
    Started,
    Finished,
    Cancelled,
}

#[account]
pub struct PollInfo {
    pub poll_id: Pubkey, // 32
    pub status: PollStatus, // 2
    pub voting_deadline: u32, // 4
    pub result: Option<u8>, // 1
    pub user: Pubkey, // 32
    pub bump: u8 // 1
}

impl PollInfo{
    pub const MAXIMUM_SIZE: usize = 32 + 2 + 4 + 1 + 32 + 1;

    pub fn create(&mut self, poll_id: Pubkey, voting_deadline: u32, user: Pubkey, bump: u8) -> Result<()> {
        self.poll_id = poll_id;
        self.status = PollStatus::Started;
        self.voting_deadline = voting_deadline;
        self.result = None;
        self.user = user;
        self.bump = bump;
        Ok(())
    }

    pub fn reveal(&mut self, result: u8) -> Result<()> {
        if self.status == PollStatus::Finished {
            return Err(ErrorsCode::PollAlreadyFinished.into());
        }
        if self.status == PollStatus::Cancelled {
            return Err(ErrorsCode::PollAlreadyCancelled.into());
        }
        self.status = PollStatus::Finished;
        self.result = Some(result);
        Ok(())
    }

    pub fn cancel(&mut self) -> Result<()> {
        if self.status == PollStatus::Cancelled {
            return Err(ErrorsCode::PollAlreadyCancelled.into());
        }
        self.status = PollStatus::Cancelled;
        self.result = None;
        Ok(())
    }

}
