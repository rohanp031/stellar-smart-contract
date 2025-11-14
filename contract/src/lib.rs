#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, Map, String, Symbol, Vec,
    Val,
};

// Define a custom error type for the contract
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Error {
    ProjectAlreadyInitialized = 1,
    DeadlineMustBeInFuture = 2,
    GoalMustBePositive = 3,
    MilestoneListEmpty = 4,
    MilestoneAmountsMismatchGoal = 5,
    ProjectNotInitialized = 6,
    DeadlinePassed = 7,
    FundingIsClosed = 8,
    FundingAmountTooLow = 9,
    GoalNotMet = 10,
    GoalAlreadyMet = 11,
    MilestoneInvalidIndex = 12,
    MilestoneAlreadyCompleted = 13,
    MilestoneNotYetApproved = 14,
    NotABacker = 15,
    AlreadyVoted = 16,
    RefundsNotAvailable = 17,
    NoRefundsToClaim = 18,
}

// --- Data Structures ---

// Represents a single milestone for the project
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Milestone {
    pub title: String,
    pub amount_to_release: u128,
    pub is_complete: bool,
    pub votes: Map<Address, bool>, // Map<BackerAddress, VotedYes>
}

// Represents the entire project state
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub struct Project {
    pub creator: Address,
    pub token: Address,      // The asset being raised (e.g., USDC)
    pub goal: u128,          // The total amount to raise
    pub raised: u128,        // The current amount raised
    pub deadline: u64,       // Ledger sequence deadline
    pub milestones: Vec<Milestone>,
    pub backers: Map<Address, u128>, // Map<BackerAddress, AmountFunded>
    pub goal_met: bool,
}

// --- Contract Keys for Storage ---
#[derive(Clone)]
#[contracttype]
enum DataKey {
    ProjectInfo,
}

#[contract]
pub struct MilestoneFund;

#[contractimpl]
impl MilestoneFund {
    /// Initializes the project. Can only be called once.
    ///
    /// # Arguments
    /// * `creator` - The address of the project creator (who will receive funds).
    /// * `token` - The address of the token asset to be raised.
    /// * `goal` - The total funding target.
    /// * `deadline` - The ledger sequence number when funding closes.
    /// * `milestones` - A vector of milestone titles and their corresponding fund release amounts.
    pub fn initialize(
        env: Env,
        creator: Address,
        token: Address,
        goal: u128,
        deadline: u64,
        milestones: Vec<(String, u128)>,
    ) -> Result<(), Error> {
        // Ensure not already initialized
        if env.storage().instance().has(&DataKey::ProjectInfo) {
            return Err(Error::ProjectAlreadyInitialized);
        }

        // --- Input Validations ---
        if deadline <= env.ledger().sequence() {
            return Err(Error::DeadlineMustBeInFuture);
        }
        if goal == 0 {
            return Err(Error::GoalMustBePositive);
        }
        if milestones.is_empty() {
            return Err(Error::MilestoneListEmpty);
        }

        let mut total_milestone_amount: u128 = 0;
        let mut milestone_vec: Vec<Milestone> = vec![&env];

        for (title, amount) in milestones.iter() {
            total_milestone_amount += amount;
            milestone_vec.push_back(Milestone {
                title,
                amount_to_release: amount,
                is_complete: false,
                votes: Map::new(&env),
            });
        }

        // The sum of milestone amounts must exactly equal the goal
        if total_milestone_amount != goal {
            return Err(Error::MilestoneAmountsMismatchGoal);
        }

        // --- Save Project State ---
        let project = Project {
            creator,
            token,
            goal,
            raised: 0,
            deadline,
            milestones: milestone_vec,
            backers: Map::new(&env),
            goal_met: false,
        };

        env.storage()
            .instance()
            .set(&DataKey::ProjectInfo, &project);
        
        // Set a Time-To-Live (TTL) for the contract data
        env.storage().instance().extend_ttl(100, 100);

        Ok(())
    }

    /// Allows a backer to fund the project.
    pub fn fund(env: Env, backer: Address) -> Result<(), Error> {
        backer.require_auth(); // The backer must authorize this
        let mut project = Self::get_project(&env)?;

        // --- Funding Period Checks ---
        if project.goal_met {
            return Err(Error::GoalAlreadyMet);
        }
        if env.ledger().sequence() > project.deadline {
            return Err(Error::DeadlinePassed);
        }

        // --- Logic for Receiving Funds ---
        // This is a simplified example. In a real contract, you'd use
        // `token.transfer_from` and get the amount from call arguments.
        // For this example, let's assume a hypothetical `amount` was passed.
        let amount_to_fund: u128 = 100; // Placeholder: This should come from `call_stack` or args

        if amount_to_fund == 0 {
            return Err(Error::FundingAmountTooLow);
        }
        
        // --- In a real contract, you'd execute the transfer ---
        // let token_client = token::Client::new(&env, &project.token);
        // token_client.transfer_from(&env.current_contract_address(), &backer, &env.current_contract_address(), &amount_to_fund);
        
        // --- Update State ---
        project.raised += amount_to_fund;
        let current_funding = project.backers.get(backer.clone()).unwrap_or(0);
        project
            .backers
            .set(backer.clone(), current_funding + amount_to_fund);

        // Check if goal is now met
        if project.raised >= project.goal {
            project.goal_met = true;
            // Optionally close funding, or allow over-funding
        }

        env.storage()
            .instance()
            .set(&DataKey::ProjectInfo, &project);

        // Emit an event (good practice)
        let topics = (symbol_short!("fund"), backer);
        env.events().publish(topics, amount_to_fund);

        Ok(())
    }

    /// Allows a backer to vote on a milestone.
    pub fn vote(env: Env, backer: Address, milestone_index: u32) -> Result<(), Error> {
        backer.require_auth();
        let mut project = Self::get_project(&env)?;

        if !project.goal_met {
            return Err(Error::GoalNotMet);
        }
        if !project.backers.contains_key(backer.clone()) {
            return Err(Error::NotABacker);
        }

        let mut milestone = project
            .milestones
            .get(milestone_index)
            .ok_or(Error::MilestoneInvalidIndex)?;

        if milestone.is_complete {
            return Err(Error::MilestoneAlreadyCompleted);
        }
        
        if milestone.votes.contains_key(backer.clone()) {
            return Err(Error::AlreadyVoted);
        }

        // Record the vote
        milestone.votes.set(backer.clone(), true);
        project.milestones.set(milestone_index, milestone);
        
        env.storage().instance().set(&DataKey::ProjectInfo, &project);
        
        Ok(())
    }

    /// Releases funds for a completed milestone.
    pub fn release_funds(env: Env, milestone_index: u32) -> Result<(), Error> {
        let mut project = Self::get_project(&env)?;
        
        if !project.goal_met {
            return Err(Error::GoalNotMet);
        }

        let mut milestone = project
            .milestones
            .get(milestone_index)
            .ok_or(Error::MilestoneInvalidIndex)?;

        if milestone.is_complete {
            return Err(Error::MilestoneAlreadyCompleted);
        }

        // --- Voting Logic ---
        // Check if total vote weight exceeds 50% of raised funds
        let mut total_vote_weight: u128 = 0;
        for (backer, _voted_yes) in milestone.votes.iter() {
            let backer_amount = project.backers.get(backer).unwrap_or(0);
            total_vote_weight += backer_amount;
        }

        // Check for > 50% approval by funding amount
        if total_vote_weight * 2 <= project.raised {
            return Err(Error::MilestoneNotYetApproved);
        }

        // --- Mark as complete and transfer funds ---
        milestone.is_complete = true;
        project.milestones.set(milestone_index, milestone.clone());
        env.storage().instance().set(&DataKey::ProjectInfo, &project);
        
        // --- Execute Transfer ---
        // let token_client = token::Client::new(&env, &project.token);
        // token_client.transfer(&env.current_contract_address(), &project.creator, &milestone.amount_to_release);

        // Emit an event
        let topics = (symbol_short!("release"), project.creator);
        env.events().publish(topics, milestone.amount_to_release);

        Ok(())
    }

    /// Allows backers to claim a refund if the goal was not met by the deadline.
    pub fn claim_refund(env: Env, backer: Address) -> Result<(), Error> {
        backer.require_auth();
        let project = Self::get_project(&env)?;

        // Refunds only available if deadline passed AND goal was NOT met
        if env.ledger().sequence() <= project.deadline || project.goal_met {
            return Err(Error::RefundsNotAvailable);
        }

        let amount_to_refund = project
            .backers
            .get(backer.clone())
            .ok_or(Error::NoRefundsToClaim)?;
            
        if amount_to_refund == 0 {
            return Err(Error::NoRefundsToClaim);
        }
        
        // --- Execute Transfer ---
        // In a real contract, this would transfer `amount_to_refund` of
        // `project.token` back to the `backer`.
        
        // --- Update State to prevent double claim ---
        // We'd need to modify the `Project` struct to track refunds,
        // or just set the backer's amount to 0. For simplicity, we assume
        // a separate storage for refunds or setting backer amount to 0.
        // let mut project_mut = project;
        // project_mut.backers.set(backer.clone(), 0);
        // env.storage().instance().set(&DataKey::ProjectInfo, &project_mut);

        Ok(())
    }

    // --- Helper & View Functions ---

    /// (View) Gets the full project details.
    pub fn get_project(env: &Env) -> Result<Project, Error> {
        env.storage()
            .instance()
            .get(&DataKey::ProjectInfo)
            .ok_or(Error::ProjectNotInitialized)
    }

    /// (View) Gets the amount a specific backer has funded.
    pub fn get_backer_info(env: Env, backer: Address) -> Result<u128, Error> {
        let project = Self::get_project(&env)?;
        Ok(project.backers.get(backer).unwrap_or(0))
    }
}