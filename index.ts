// index.ts - Main Worker File
import {
  createClient,
  Env,
  stripeBalanceMiddleware,
  type StripeUser,
} from "stripeflare";
export { DORM } from "stripeflare";

// HTML template
const template = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StripeFlare P2P Payments</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
          :root {
              --primary: #635bff;
              --primary-dark: #5147e6;
              --bg-light: #f8f9fc;
              --text-dark: #2a2a2a;
              --text-light: #6b7280;
              --border-color: #e5e7eb;
              --success: #10b981;
              --warning: #f59e0b;
              --danger: #ef4444;
              --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
  
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
  
          body {
              font-family: 'Inter', sans-serif;
              background-color: var(--bg-light);
              color: var(--text-dark);
              line-height: 1.6;
          }
  
          .container {
              max-width: 900px;
              margin: 0 auto;
              padding: 40px 20px;
          }
  
          .card {
              background: white;
              border-radius: 12px;
              box-shadow: var(--shadow);
              padding: 30px;
              margin-bottom: 25px;
          }
  
          .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 30px;
              flex-wrap: wrap;
              gap: 20px;
          }
  
          .title-section {
              display: flex;
              align-items: center;
          }
  
          .logo {
              font-size: 28px;
              margin-right: 12px;
              color: var(--primary);
          }
  
          h1 {
              color: var(--primary);
              font-weight: 700;
              font-size: 24px;
              margin: 0;
          }
  
          .user-info {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
          }
  
          .balance {
              font-size: 18px;
              font-weight: 600;
              color: var(--primary);
              background-color: rgba(99, 91, 255, 0.1);
              padding: 8px 16px;
              border-radius: 8px;
              margin-bottom: 10px;
          }
  
          .wallet-address {
              font-size: 14px;
              color: var(--text-light);
              background-color: var(--bg-light);
              padding: 8px 12px;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
              transition: all 0.2s ease;
          }
  
          .wallet-address:hover {
              background-color: #eef1f6;
          }
  
          .user-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
          }
  
          .user-table th {
              text-align: left;
              padding: 12px 16px;
              background-color: var(--bg-light);
              color: var(--text-light);
              font-weight: 600;
              font-size: 14px;
              border-bottom: 1px solid var(--border-color);
          }
  
          .user-table td {
              padding: 16px;
              border-bottom: 1px solid var(--border-color);
              font-size: 14px;
          }
  
          .user-table tr:last-child td {
              border-bottom: none;
          }
  
          .user-table tr:hover {
              background-color: rgba(99, 91, 255, 0.05);
          }
  
          .send-button {
              background: var(--primary);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
          }
  
          .send-button:hover:not(:disabled) {
              background: var(--primary-dark);
              transform: translateY(-1px);
          }
  
          .send-button:disabled {
              background: #a5a5a5;
              cursor: not-allowed;
          }
  
          .payment-button {
              background: var(--primary);
              color: white;
              border: none;
              padding: 14px 28px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              text-decoration: none;
              display: inline-block;
              transition: all 0.2s ease;
              text-align: center;
              margin: 20px 0;
          }
  
          .payment-button:hover {
              background: var(--primary-dark);
              transform: translateY(-1px);
          }
  
          .badge {
              padding: 4px 10px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              display: inline-flex;
              align-items: center;
          }
  
          .badge-success {
              background-color: rgba(16, 185, 129, 0.1);
              color: var(--success);
          }
  
          .badge-primary {
              background-color: rgba(99, 91, 255, 0.1);
              color: var(--primary);
          }
  
          .badge-warning {
              background-color: rgba(245, 158, 11, 0.1);
              color: var(--warning);
          }
  
          .badge-danger {
              background-color: rgba(239, 68, 68, 0.1);
              color: var(--danger);
          }
  
          .modal {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              justify-content: center;
              align-items: center;
          }
  
          .modal-content {
              background-color: white;
              padding: 30px;
              border-radius: 12px;
              box-shadow: var(--shadow);
              width: 90%;
              max-width: 500px;
          }
  
          .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 20px;
          }
  
          .modal-title {
              font-size: 20px;
              font-weight: 600;
          }
  
          .close-button {
              background: none;
              border: none;
              font-size: 20px;
              cursor: pointer;
              color: var(--text-light);
          }
  
          .form-group {
              margin-bottom: 20px;
          }
  
          .form-label {
              display: block;
              margin-bottom: 8px;
              font-weight: 500;
              font-size: 14px;
              color: var(--text-dark);
          }
  
          .form-control {
              width: 100%;
              padding: 12px;
              border: 1px solid var(--border-color);
              border-radius: 6px;
              font-size: 14px;
              transition: border-color 0.2s ease;
          }
  
          .form-control:focus {
              outline: none;
              border-color: var(--primary);
          }
  
          .btn-primary {
              background: var(--primary);
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s ease;
              width: 100%;
          }
  
          .btn-primary:hover {
              background: var(--primary-dark);
          }
  
          .message {
              padding: 12px;
              margin-top: 10px;
              border-radius: 6px;
              font-size: 14px;
              display: none;
          }
  
          .message-error {
              background-color: rgba(239, 68, 68, 0.1);
              color: var(--danger);
              border-left: 4px solid var(--danger);
          }
  
          .message-success {
              background-color: rgba(16, 185, 129, 0.1);
              color: var(--success);
              border-left: 4px solid var(--success);
          }
  
          .tooltip {
              position: relative;
              display: inline-block;
          }
  
          .tooltip .tooltiptext {
              visibility: hidden;
              width: 140px;
              background-color: #333;
              color: #fff;
              text-align: center;
              border-radius: 6px;
              padding: 5px;
              position: absolute;
              z-index: 1;
              bottom: 125%;
              left: 50%;
              margin-left: -70px;
              opacity: 0;
              transition: opacity 0.3s;
              font-size: 12px;
          }
  
          .tooltip .tooltiptext::after {
              content: "";
              position: absolute;
              top: 100%;
              left: 50%;
              margin-left: -5px;
              border-width: 5px;
              border-style: solid;
              border-color: #333 transparent transparent transparent;
          }
  
          .tooltip:hover .tooltiptext {
              visibility: visible;
              opacity: 1;
          }
      </style>
  </head>
  
  <body>
      <div class="container">
          <div class="card">
              <div class="header">
                  <div class="title-section">
                      <div class="logo">🔄</div>
                      <h1>StripeFlare P2P Payments</h1>
                  </div>
                  <div id="user-info" class="user-info">
                      <div id="balance" class="balance">Balance: $0.00</div>
                      <div id="wallet-address" class="wallet-address" onclick="copyWalletAddress()">
                          <span id="wallet-text">No wallet yet</span>
                          <span>📋</span>
                      </div>
                  </div>
              </div>
  
              <div id="unpaid-message" style="display: none;">
                  <p>You need to add funds to your wallet before you can send payments.</p>
                  <a id="paymentLink" href="#" class="payment-button">Add Funds with Stripe</a>
              </div>
  
              <div id="users-container">
                  <h2>Users</h2>
                  <table class="user-table">
                      <thead>
                          <tr>
                              <th>Name</th>
                              <th>Wallet Address</th>
                              <th>Balance</th>
                              <th>Actions</th>
                          </tr>
                      </thead>
                      <tbody id="users-table-body">
                          <tr>
                              <td colspan="4" style="text-align: center;">Loading users...</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  
      <!-- Send Money Modal -->
      <div id="sendMoneyModal" class="modal">
          <div class="modal-content">
              <div class="modal-header">
                  <h2 class="modal-title">Send Money</h2>
                  <button class="close-button" onclick="closeModal()">&times;</button>
              </div>
              <form id="sendMoneyForm">
                  <div class="form-group">
                      <label class="form-label">To:</label>
                      <input type="text" id="recipientName" class="form-control" readonly>
                      <input type="hidden" id="recipientId">
                  </div>
                  <div class="form-group">
                      <label class="form-label">Amount (in cents):</label>
                      <input type="number" id="amount" class="form-control" min="1" required>
                  </div>
                  <button type="submit" class="btn-primary">Send Money</button>
              </form>
              <div id="errorMessage" class="message message-error"></div>
              <div id="successMessage" class="message message-success"></div>
          </div>
      </div>
  
      <script>
          // User data from the server
          const userData = window.userData || { currentUser: null, users: [], hasPaid: false };
          
          // DOM elements
          const balanceElement = document.getElementById('balance');
          const walletAddressElement = document.getElementById('wallet-address');
          const walletTextElement = document.getElementById('wallet-text');
          const unpaidMessageElement = document.getElementById('unpaid-message');
          const usersTableBody = document.getElementById('users-table-body');
          const paymentLinkElement = document.getElementById('paymentLink');
          const modal = document.getElementById('sendMoneyModal');
          const recipientNameInput = document.getElementById('recipientName');
          const recipientIdInput = document.getElementById('recipientId');
          const amountInput = document.getElementById('amount');
          const errorMessageElement = document.getElementById('errorMessage');
          const successMessageElement = document.getElementById('successMessage');
          const sendMoneyForm = document.getElementById('sendMoneyForm');
  
          // Initialize the UI
          function initializeUI() {
              if (userData.currentUser) {
                  // Display user balance
                  balanceElement.textContent = 'Balance: $' + (userData.currentUser.balance / 100).toFixed(2);
                  
                  // Display wallet address
                  if (userData.currentUser.client_reference_id) {
                      walletTextElement.textContent = shortenAddress(userData.currentUser.client_reference_id);
                      walletAddressElement.setAttribute('data-address', userData.currentUser.client_reference_id);
                  } else {
                      walletTextElement.textContent = 'No wallet address';
                  }
              }
  
              // Display or hide unpaid message
              if (!userData.hasPaid) {
                  unpaidMessageElement.style.display = 'block';
                  if (userData.currentUser && userData.currentUser.client_reference_id) {
                      paymentLinkElement.href = 'https://buy.stripe.com/4gM5kC8rOdNve5J4PveNh3A?client_reference_id=' + 
                          userData.currentUser.client_reference_id;
                  }
              }
  
              // Populate users table
              populateUsersTable();
          }
  
          // Populate users table with data
          function populateUsersTable() {
              if (!userData.users || userData.users.length === 0) {
                  usersTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No users found</td></tr>';
                  return;
              }
  
              usersTableBody.innerHTML = '';
              
              userData.users.forEach(user => {
                  const row = document.createElement('tr');
                  
                  // Highlight current user's row
                  if (userData.currentUser && user.access_token === userData.currentUser.access_token) {
                      row.style.backgroundColor = 'rgba(99, 91, 255, 0.08)';
                  }
  
                  // Name column
                  const nameCell = document.createElement('td');
                  nameCell.textContent = user.name || 'Anonymous User';
                  
                  // Wallet address column
                  const addressCell = document.createElement('td');
                  const addressText = document.createElement('div');
                  addressText.classList.add('tooltip');
                  addressText.textContent = shortenAddress(user.client_reference_id);
                  
                  const tooltip = document.createElement('span');
                  tooltip.classList.add('tooltiptext');
                  tooltip.textContent = 'Click to copy';
                  addressText.appendChild(tooltip);
                  
                  addressText.style.cursor = 'pointer';
                  addressText.onclick = () => copyToClipboard(user.client_reference_id);
                  addressCell.appendChild(addressText);
                  
                  // Balance column
                  const balanceCell = document.createElement('td');
                  balanceCell.textContent = '$' + (user.balance / 100).toFixed(2);
                  
                  // Actions column
                  const actionsCell = document.createElement('td');
                  const sendButton = document.createElement('button');
                  sendButton.classList.add('send-button');
                  sendButton.textContent = 'Send Money';
                  
                  // Disable button if current user has no balance or it's the current user's row
                  if (!userData.hasPaid || 
                      (userData.currentUser && user.access_token === userData.currentUser.access_token)) {
                      sendButton.disabled = true;
                      if (userData.currentUser && user.access_token === userData.currentUser.access_token) {
                          sendButton.textContent = 'This is you';
                      }
                  } else {
                      sendButton.onclick = () => openSendMoneyModal(user);
                  }
                  
                  actionsCell.appendChild(sendButton);
                  
                  // Add cells to row
                  row.appendChild(nameCell);
                  row.appendChild(addressCell);
                  row.appendChild(balanceCell);
                  row.appendChild(actionsCell);
                  
                  // Add row to table
                  usersTableBody.appendChild(row);
              });
          }
  
          // Utility function to shorten address for display
          function shortenAddress(address) {
              if (!address) return 'N/A';
              if (address.length <= 12) return address;
              return address.substring(0, 6) + '...' + address.substring(address.length - 6);
          }
  
          // Copy wallet address to clipboard
          function copyWalletAddress() {
              const address = walletAddressElement.getAttribute('data-address');
              if (address) {
                  copyToClipboard(address);
              }
          }
  
          // Copy text to clipboard
          function copyToClipboard(text) {
              navigator.clipboard.writeText(text).then(() => {
                  alert('Copied to clipboard: ' + text);
              }).catch(err => {
                  console.error('Could not copy text: ', err);
              });
          }
  
          // Open send money modal
          function openSendMoneyModal(recipient) {
              recipientNameInput.value = recipient.name || 'Anonymous User';
              recipientIdInput.value = recipient.client_reference_id;
              amountInput.value = '';
              errorMessageElement.style.display = 'none';
              successMessageElement.style.display = 'none';
              modal.style.display = 'flex';
          }
  
          // Close modal
          function closeModal() {
              modal.style.display = 'none';
          }
  
          // Handle form submission
          sendMoneyForm.addEventListener('submit', async function(e) {
              e.preventDefault();
              
              const recipientId = recipientIdInput.value;
              const amount = parseInt(amountInput.value);
              
              if (!recipientId || isNaN(amount) || amount <= 0) {
                  showError('Please enter a valid amount');
                  return;
              }
              
              try {
                  const response = await fetch('/send-money', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                          recipient: recipientId,
                          amount: amount
                      }),
                  });
                  
                  const result = await response.json();
                  
                  if (response.ok) {
                      showSuccess(result.message || 'Payment sent successfully!');
                      
                      // Update the UI after successful payment
                      setTimeout(() => {
                          window.location.reload();
                      }, 2000);
                  } else {
                      showError(result.message || 'Failed to send payment');
                  }
              } catch (error) {
                  showError('An error occurred. Please try again.');
                  console.error('Error:', error);
              }
          });
  
          // Show error message
          function showError(message) {
              errorMessageElement.textContent = message;
              errorMessageElement.style.display = 'block';
              successMessageElement.style.display = 'none';
          }
  
          // Show success message
          function showSuccess(message) {
              successMessageElement.textContent = message;
              successMessageElement.style.display = 'block';
              errorMessageElement.style.display = 'none';
          }
  
          // Close modal when clicking outside
          window.onclick = function(event) {
              if (event.target === modal) {
                  closeModal();
              }
          }
  
          // Initialize the UI when the page loads
          document.addEventListener('DOMContentLoaded', initializeUI);
      </script>
  </body>
  </html>`;

// Define the user interface extending StripeUser
interface User extends StripeUser {
  // You can add additional properties if needed
}

// Define database migrations
export const migrations = {
  1: [
    `CREATE TABLE users (
        access_token TEXT PRIMARY KEY,
        balance INTEGER DEFAULT 0,
        name TEXT,
        email TEXT,
        verified_email TEXT,
        verified_user_access_token TEXT,
        card_fingerprint TEXT,
        client_reference_id TEXT
      )`,
    `CREATE INDEX idx_users_balance ON users(balance)`,
    `CREATE INDEX idx_users_name ON users(name)`,
    `CREATE INDEX idx_users_email ON users(email)`,
    `CREATE INDEX idx_users_verified_email ON users(verified_email)`,
    `CREATE INDEX idx_users_card_fingerprint ON users(card_fingerprint)`,
    `CREATE INDEX idx_users_client_reference_id ON users(client_reference_id)`,
  ],
};

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // Handle money transfer endpoint
    if (url.pathname === "/send-money" && request.method === "POST") {
      return handleSendMoney(request, env, ctx);
    }

    // Process the request through Stripeflare middleware
    const result = await stripeBalanceMiddleware<User>(
      request,
      env,
      ctx,
      migrations,
      "1.0.0", // Version for your database
    );

    // If middleware returned a response (webhook or db api), return it directly
    if (result.response) {
      return result.response;
    }

    if (!result.session) {
      return new Response("Something went wrong", { status: 404 });
    }

    // Get current user data
    const currentUser = result.session.user;

    // Create aggregate client to fetch all users
    const aggregateClient = createClient({
      doNamespace: env.DORM_NAMESPACE,
      ctx,
      migrations,
      name: "aggregate",
      version: "1.0.0",
    });

    // Fetch all users with balance > 0 to display in the list
    const allUsers = await aggregateClient
      .exec<User>(
        "SELECT access_token, name, balance, client_reference_id FROM users",
      )
      .toArray();

    // Check if current user has paid (has balance)
    const hasPaid = currentUser.balance > 0;

    // Prepare the data to inject into HTML
    const userData = {
      currentUser,
      users: allUsers,
      hasPaid,
    };

    // Inject the data into the HTML template
    const modifiedHtml = template.replace(
      "</head>",
      `<script>window.userData = ${JSON.stringify(userData)};</script></head>`,
    );

    // Set up response headers
    const headers = new Headers(result.session.headers || {});
    headers.append("Content-Type", "text/html");

    return new Response(modifiedHtml, { headers });
  },
};

// Handler for money transfer between users
async function handleSendMoney(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  try {
    // Process the request through Stripeflare middleware to get user session
    const result = await stripeBalanceMiddleware<User>(
      request,
      env,
      ctx,
      migrations,
      "1.0.0",
    );

    if (!result.session) {
      return new Response(
        JSON.stringify({ success: false, message: "User session not found" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // Get sender user
    const sender = result.session.user;

    // Parse request body to get recipient and amount
    const { recipient, amount } = (await request.json()) as {
      recipient: string;
      amount: number;
    };

    if (!recipient || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid recipient or amount",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check if sender has enough balance
    if (sender.balance < amount) {
      return new Response(
        JSON.stringify({ success: false, message: "Insufficient balance" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Create client for the sender
    const senderClient = createClient({
      doNamespace: env.DORM_NAMESPACE,
      ctx,
      migrations,
      name: sender.access_token,
      mirrorName: "aggregate",
      version: "1.0.0",
    });

    // Deduct amount from sender
    const deductUpdate = senderClient.exec(
      "UPDATE users SET balance = balance - ? WHERE access_token = ? AND balance >= ?",
      amount,
      sender.access_token,
      amount,
    );

    await deductUpdate.toArray();

    // Check if the deduction was successful
    if (deductUpdate.rowsWritten === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Insufficient balance or transaction failed",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Find recipient by client_reference_id
    const aggregateClient = createClient({
      doNamespace: env.DORM_NAMESPACE,
      ctx,
      migrations,
      name: "aggregate",
      version: "1.0.0",
    });

    const recipientUser = await aggregateClient
      .exec<User>(
        "SELECT access_token FROM users WHERE client_reference_id = ?",
        recipient,
      )
      .one()
      .catch(() => null);

    if (!recipientUser) {
      // Rollback sender's deduction if recipient not found
      await senderClient
        .exec(
          "UPDATE users SET balance = balance + ? WHERE access_token = ?",
          amount,
          sender.access_token,
        )
        .toArray();

      return new Response(
        JSON.stringify({ success: false, message: "Recipient not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // Create client for the recipient
    const recipientClient = createClient({
      doNamespace: env.DORM_NAMESPACE,
      ctx,
      migrations,
      name: recipientUser.access_token,
      mirrorName: "aggregate",
      version: "1.0.0",
    });

    // Add amount to recipient
    await recipientClient
      .exec(
        "UPDATE users SET balance = balance + ? WHERE access_token = ?",
        amount,
        recipientUser.access_token,
      )
      .toArray();

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully sent $${(amount / 100).toFixed(2)} to recipient`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
