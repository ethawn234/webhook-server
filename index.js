import express, { json } from 'express';
const app = express();
import createIssue from './api.js';


// This defines a POST route at the `/webhook` path. This path matches the path that you specified for the smee.io forwarding. 
// For more information, see [Forward webhooks](#forward-webhooks).
//
// Once you deploy your code to a server and update your webhook URL, you should change this to match the path portion of the URL for your webhook.
app.post('/webhook', json({type: 'application/json'}), async (req, res) => {

  // Respond to indicate that the delivery was successfully received.
  // Your server should respond with a 2XX res within 10 seconds of receiving a webhook delivery. If your server takes longer than that to respond, then GitHub terminates the connection and considers the delivery a failure.
  res.status(202).send('Accepted');

  // Check the `x-github-event` header to learn what event type was sent.
  const githubEvent = req.headers['x-github-event'];
  const securityEvents = ['dependabot_alert', 'code_scanning_alert', 'secret_scanning_alert']

  // Log all incoming events for debugging
  console.log(`Received GitHub event: ${githubEvent}`);
  console.log(`Request body keys:`, Object.keys(req.body));
  console.log(`Action (if present):`, req.body?.action);

  // You should add logic to handle each event type that your webhook is subscribed to.
  // For example, this code handles the `issues` and `ping` events.
  //
  // If any events have an `action` field, you should also add logic to handle each action that you are interested in.
  // For example, this code handles the `opened` and `closed` actions for the `issue` event.
  //
  // For more information about the data that you can expect for each event type, see [AUTOTITLE](/webhooks/webhook-events-and-payloads).
  // const data = req.body;
  // console.log('event: ', githubEvent)
  if (githubEvent === 'dependabot_alert') {
    const data = req.body;
    const action = data.action;
    console.log('Data.Action:', action);
    
    console.log('=== Dependabot Alert Event ===');
    // console.log('Action:', action);
    // console.log('Alert data:', JSON.stringify(data.alert, null, 2));
    // console.log('Repository:', data.repository?.name);
    // console.log('Owner:', data.repository?.owner?.login);

    if (action === 'created' || action === 'appeared_in_branch' || action === 'auto_reopened' || action === 'reopened') {
      const owner = data.repository.owner.login;
      const repo = data.repository.name;
      const title = data.alert.security_advisory.cve_id || `Security Alert: ${data.alert.security_vulnerability.package.name}`;
      
      const prompt = 'Write a Jira ticket for the Dependabot Issue details below. In the ticket, include any context a developer needs to remediate the Dependabot Issue.';
      let body = `${prompt}\n\n**Security Advisory**: ${data.alert.security_advisory.summary}\n\n**Alert URL**: ${data.alert.html_url}\n\n**Package**: ${data.alert.security_vulnerability.package.name}\n**Severity**: ${data.alert.security_advisory.severity}`;
      
      try {
        const newIssue = await createIssue(owner, repo, title, body);
        console.log(`An issue was created with this title: ${newIssue.title}`);
      } catch (error) {
        console.error('Failed to create GitHub issue:', error.message);
      }
    }
  } else if (githubEvent === 'ping') {
    console.log('GitHub sent the ping event');
  } else {
    console.log(`Unhandled event: ${githubEvent}`);
  }

  // on security alert, create issue. Then assign to Copilot
});

// This defines the port where your server should listen.
// 3000 matches the port that you specified for webhook forwarding. For more information, see [Forward webhooks](#forward-webhooks).
//
// Once you deploy your code to a server, you should change this to match the port where your server is listening.
const port = 3000;

// This starts the server and tells it to listen at the specified port.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
