use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
pub mod state;

declare_id!("8xgpGQtTaPPppnnf6iDkUP1zzDsqXfdZgoMG7jUSEwov");

#[program]
pub mod voting {
    use super::*;

    pub fn create_poll_data(ctx: Context<CreatePollData>, poll_id: Pubkey) -> Result<()> {
        instructions::create_poll_data::create_poll_data(ctx, poll_id)
    }

    pub fn update_poll_data(ctx: Context<UpdatePollData>, poll_id: Pubkey) -> Result<()> {
        instructions::update_poll_data::update_poll_data(ctx, poll_id)
    }

    pub fn create_voter(ctx: Context<CreateVoter>) -> Result<()> {
        instructions::create_voter::create_voter(ctx)
    }

    pub fn create_poll(ctx: Context<CreatePoll>, voting_deadline: u32) -> Result<()> {
        instructions::create_poll::create_poll(ctx, voting_deadline)
    }

    pub fn reveal_poll(ctx: Context<RevealPoll>, result: u8) -> Result<()> {
        instructions::reveal_poll::reveal_poll(ctx, result)
    }

    pub fn cancel_poll(ctx: Context<CancelPoll>) -> Result<()> {
        instructions::cancel_poll::cancel_poll(ctx)
    }

    pub fn create_vote(ctx: Context<CreateVote>, vote: String, tokens_staked: u32) -> Result<()> {
        instructions::create_vote::create_vote(ctx, vote, tokens_staked)
    }

    pub fn update_vote(ctx: Context<UpdateVote>, vote: String, tokens_staked: u32) -> Result<()> {
        instructions::update_vote::update_vote(ctx, vote, tokens_staked)
    }
}
