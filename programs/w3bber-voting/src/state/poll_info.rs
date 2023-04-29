use anchor_lang::prelude::*;
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
    pub bump: u8 // 1
}

impl PollInfo{
    pub const MAXIMUM_SIZE: usize = 32 + 2 + 4 + 1 + 1;

    pub fn create(&mut self, poll_id: Pubkey, voting_deadline: u32) -> Result<()> {
        self.poll_id = poll_id;
        self.status = PollStatus::Started;
        self.voting_deadline = voting_deadline;
        self.result = None;
        Ok(())
    }

    pub fn reveal(&mut self, result: u8) -> Result<()> {
        self.status = PollStatus::Finished;
        self.result = Some(result);
        Ok(())
    }

    pub fn cancel(&mut self) -> Result<()> {
        self.status = PollStatus::Cancelled;
        self.result = None;
        Ok(())
    }

}
