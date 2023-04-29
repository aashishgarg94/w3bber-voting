use crate::state::voter_poll_data_info::*;
use anchor_lang::prelude::*;

pub fn create_voter_poll_data(ctx: Context<CreateVoterPollData>, voter_id: Pubkey, poll_id: Pubkey) -> Result<()> {
    let voter_poll_data_account = &mut ctx.accounts.voter_poll_data_account;
    voter_poll_data_account.update(voter_id, poll_id);
    Ok(())
}

#[derive(Accounts)]
pub struct CreateVoterPollData<'info>{
    #[account(init, payer = user, space = 8 + VoterPollDataInfo::MAXIMUM_SIZE)]
    pub voter_poll_data_account: Account<'info, VoterPollDataInfo>,

    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>
}