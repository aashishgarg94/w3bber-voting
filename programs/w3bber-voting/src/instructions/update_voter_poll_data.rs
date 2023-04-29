use crate::state::voter_poll_data_info::*;
use anchor_lang::prelude::*;

pub fn update_voter_poll_data(ctx: Context<UpdateVoterPollData>, user_id: Pubkey, content_id: Pubkey) -> Result<()> {
    let user_data = &mut ctx.accounts.voter_poll_data_account;
    user_data.update(user_id, content_id);
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateVoterPollData<'info>{
    #[account(mut)]
    pub voter_poll_data_account: Account<'info, VoterPollDataInfo>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>
}