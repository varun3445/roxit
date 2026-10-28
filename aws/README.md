# Roxit on AWS

Cognito (sign in) → API Gateway HTTP API (JWT authorizer) → Lambda → DynamoDB.
Free-tier friendly. No servers, no CLI needed.

## Set up (about 10 minutes)

1. Sign in to the AWS console, pick a region (e.g. `eu-west-2`, London).
2. CloudFormation → Create stack → With new resources → Upload `aws/template.yaml`.
   Name it `roxit`. Acknowledge that it creates IAM roles. Create.
3. When the stack shows `CREATE_COMPLETE`, open its **Outputs** tab: `Region`, `ClientId`, `ApiUrl`.
4. Edit `config.js` and add the values:

   ```js
   window.ROXIT_CONFIG={
     url:"https://lhnjqauudgpsdvddczwn.supabase.co", key:"sb_publishable_…",  // old Supabase, ignored once aws is set
     aws:{region:"<Region>", clientId:"<ClientId>", api:"<ApiUrl>"}
   };
   ```
5. Commit and push. Vercel redeploys. Create an account in the app (you get an email code).
6. Optional: your old data. Sign in to Supabase once more before switching, or open the app on the device that has it: local data uploads automatically on first sign-in to AWS.

None of these values are secrets. Access is enforced by the JWT authorizer, and the Lambda only ever reads the row for the caller's `sub`.

## Data model

One table, `roxit-state`.

| Attribute | Type | Notes |
|---|---|---|
| `user_id` (partition key) | S | Cognito `sub` |
| `ts` | N | client write time (ms) |
| `json` | S | whole app state, stringified |
| `updated_at` | S | ISO time |

**Why `user_id` alone:** every request is "give me everything for this user" or "replace everything for this user". That is a single-key GetItem/PutItem, so there is no query, no scan, no index, and cost and latency stay flat as users grow. The key also spreads load evenly across partitions because users are independent.

**Why one item per user:** the whole state is a few KB and always read and written together. Splitting plans and logs across items would add round trips and lose atomic writes for no gain. DynamoDB's item limit is 400 KB; the Lambda rejects bodies above 380 KB.

**Conflict handling:** writes use a condition (`attribute_not_exists(user_id) OR ts <= :t`). A stale device can't overwrite newer data; it gets a 409 and pulls instead (last-writer-wins by client timestamp).

**When I'd change it:** if logs grow large or need cross-user queries (leaderboards, coach views), move to `PK = user_id`, `SK = LOG#<date>` / `PLAN#<id>` so a day or plan is its own item and a date range is a single Query.

## Cost

Provisioned 5 RCU / 5 WCU, Lambda and HTTP API, and Cognito (first 10k users free) are all inside the free tier.

## Teardown

Delete the CloudFormation stack. Remove `aws` from `config.js` to go back to Supabase.
