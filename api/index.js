const express = require('express');
const axios = require('axios');

const app = express();

// API Route
app.get('/result', async (req, res) => {
  const number = req.query.num;

  if (!number) {
    return res.status(400).json({
      status: "error",
      message: "Please provide a 'num' parameter with a valid phone number."
    });
  }

  try {
    const url = `https://app.mynagad.com:20002/api/user/check-user-status-for-log-in?msisdn=${number}`;
    const headers = {
      "X-KM-User-AspId": "100012345612345",
      "X-KM-User-Agent": "ANDROID/1152",
      "X-KM-DEVICE-FGP": "19DC58E052A91F5B2EB59399AABB2B898CA68CFE780878C0DB69EAAB0553C3C6",
      "X-KM-Accept-language": "bn",
      "X-KM-AppCode": "01",
    };

    const response = await axios.get(url, { headers });
    const responseData = response.data;

    // Check if the Nagad account exists
    if (responseData.name) {
      const result = {
        status: "success",
        name_bn: responseData.name,
        user_id: responseData.userId,
        status: responseData.status,
        user_type: responseData.userType
      };
      return res.json(result);
    } else if (responseData.reason) {
      return res.json({
        status: "error",
        message: "No Nagad account found for the provided number."
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Unexpected response from the Nagad API.",
        raw: responseData
      });
    }
  } catch (error) {
    console.error("Error fetching Nagad details:", error.message);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while processing the request.",
    });
  }
});

// Export for Vercel
module.exports = app;
