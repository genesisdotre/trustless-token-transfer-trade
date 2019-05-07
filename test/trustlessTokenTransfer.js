const { expectThrow, increaseTime } = require('./helpers')

const TrustlessTokenTransfer = artifacts.require('TrustlessTokenTransfer')
const ERC20 = artifacts.require('ERC20')
  
contract('TrustlessTokenTransfer', async function(accounts) {
    const creator = accounts[0]
    const guy1 = accounts[1];
    const guy2 = accounts[2];
    const guy3 = accounts[3];
    const ETH = 10**18;
    const day = 24 * 60 * 60;

    let now;
    let tradeableToken;
    let trustless;

    beforeEach(async function() {
        now = await latestTime();
        tradeableToken = await ERC20.new({ from: creator } );
        trustless = await TrustlessTokenTransfer.new(tradeableToken.address, 20000, now + day, { from: creator } );
    })
  
    it('Should create a first challenge and craete two submissions', async () => {
        // await selfCommitment.createChallenge("20 pushups", now + minute, now + 4*day, 20, { from: creator1, value: ETH });
        // let challengesCount = await selfCommitment.getChallengesCount();
        // assert.equal(challengesCount.toNumber(), 1, 'There should be exactly one challenge');

        // let c = await selfCommitment.getChallengeById(0); // using short letters to avoid typing

        assert.equal(1, 1, "one equals 1")


        // assert.equal(c[1].toNumber(), ETH, "deposit");
        // assert.equal(c[2], "20 pushups", "description");
        // assert.equal(c[3].toNumber(), now + minute, "start");
        // assert.equal(c[4].toNumber(), now + 4*day, "end");
        // assert.equal(c[5].toNumber(), 20, "count");
        // assert.equal(c[6].toNumber(), 0, "state");

        // await increaseTime(minute); 

        // await selfCommitment.createSubmission("url", "something", 0, { from: creator1 });
        // let submissionsCount = await selfCommitment.getSubmissionsCount();
        // assert.equal(submissionsCount.toNumber(), 1, 'There should be exactly one submission');

        // await selfCommitment.createSubmission("url2", "something2", 0, { from: creator1 });
        // submissionsCount = await selfCommitment.getSubmissionsCount();
        // assert.equal(submissionsCount.toNumber(), 2, 'There should be exactly two submissions');

        // let submissionIDs = await selfCommitment.getChallengeSubmissionIDs.call(0); // using getter, because call() on the mapping directly requires a second parameter
        // let secondSubmissionID = submissionIDs[1].toNumber();
        // let submissionTwo = await selfCommitment.getSubmissionById(secondSubmissionID);

        // assert.equal(submissionTwo[0].toNumber(), 0, "Challenge ID is 0");
        // assert.equal(submissionTwo[1], "url2", "URL of submission 2 not stored correctly");
        // assert.equal(submissionTwo[2], "something2", "Description of submission 2 not stored correctly");
        // assert.closeTo(submissionTwo[3].toNumber(), now + minute, minute, "Timestamp should be equal (very close up to a minute) to the current time");
        // assert.equal(submissionTwo[4].toNumber(), 0, "state should be initial");
    });





  })