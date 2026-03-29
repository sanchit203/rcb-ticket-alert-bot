import { EventBridgeClient, DisableRuleCommand } from "@aws-sdk/client-eventbridge";

export async function disableSchedulerRule() {
  const ruleName = process.env.SCHEDULER_RULE_NAME;
  if (!ruleName) {
    console.warn("[Scheduler] SCHEDULER_RULE_NAME not set, cannot disable rule");
    return;
  }

  console.log(`[Scheduler] Disabling EventBridge rule: ${ruleName}`);
  try {
    const client = new EventBridgeClient();
    await client.send(new DisableRuleCommand({ Name: ruleName }));
    console.log(`[Scheduler] Rule "${ruleName}" disabled successfully`);
  } catch (err) {
    console.error(`[Scheduler] Failed to disable rule: ${err.message}`);
  }
}
