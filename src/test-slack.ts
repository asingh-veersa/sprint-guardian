import { sendSlackMessage } from "./integrations/slack";

async function testSlackCommunication() {
  try {
    const testMessage = `🧪 *Slack Communication Test*\n\n` +
      `This is a test message from the Sprint Guardian GitHub Actions workflow.\n` +
      `Timestamp: ${new Date().toISOString()}\n\n` +
      `✅ If you see this message, Slack integration is working correctly!`;

    console.log("Sending test message to Slack...");
    await sendSlackMessage(testMessage);
    console.log("✅ Successfully sent test message to Slack!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to send Slack message:", error);
    process.exit(1);
  }
}

testSlackCommunication();
