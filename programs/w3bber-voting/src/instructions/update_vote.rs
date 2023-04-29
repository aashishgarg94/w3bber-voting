use crate::state::individual_vote::*;
use anchor_lang::prelude::*;

pub fn update_vote(ctx: Context<UpdateVote>, vote: String, tokens_staked: u32) -> Result<()> {
    let vote_account = &mut ctx.accounts.vote_account;
    vote_account.update(vote, tokens_staked);

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateVote<'info>{
    #[account(mut, constraint = user.key == &vote_account.voter_id, seeds = [vote_account.voter_id.as_ref(), vote_account.poll_id.as_ref()], bump = vote_account.bump)]
    pub vote_account: Account<'info, IndividualVote>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}