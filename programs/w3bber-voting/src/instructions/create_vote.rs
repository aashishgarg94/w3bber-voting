use crate::state::voter_info::*;
use crate::state::poll_info::*;
use crate::state::individual_vote::*;
use crate::state::error_code::*;
use anchor_lang::prelude::*;

pub fn create_vote(ctx: Context<CreateVote>, vote: String, tokens_staked: u32) -> Result<()> {
    let poll_account = &ctx.accounts.poll_account;
    let voter_account = &ctx.accounts.voter_account;
    let vote_account = &mut ctx.accounts.vote_account;
    let bump = *ctx.bumps.get("vote_account").ok_or(ErrorsCode::CannotGetBump)?;
    match vote_account.create(poll_account.poll_id, voter_account.voter_id, vote, tokens_staked, bump) {
        Ok(_) => Ok(()),
        Err(e) => return Err(e)
    }
}

#[derive(Accounts)]
pub struct CreateVote<'info>{
    #[account(mut, seeds = [b"voter".as_ref(), voter_account.voter_id.as_ref()], bump = voter_account.bump)]
    pub voter_account: Account<'info, VoterInfo>,

    #[account(mut, seeds = [poll_account.poll_id.as_ref()], bump = poll_account.bump)]
    pub poll_account: Account<'info, PollInfo>,

    #[account(init, payer = user, space = IndividualVote::MAXIMUM_SIZE + 8, seeds = [voter_account.voter_id.as_ref(), poll_account.poll_id.as_ref()], bump)]
    pub vote_account: Account<'info, IndividualVote>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>
}