const express = require('express');
const app = express();

// Define the main API route
app.get('/result', (req, res) => {
  const num = parseFloat(req.query.num);

  if (isNaN(num)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid or missing 'num' parameter. Please provide a valid number.",
      Dev: "aftab"
    });
  }

  const result = num * num;
  res.json({
    status: "success",
    result: `${num} square is ${result}`,
    Dev: "aftab"
  });
});

// Start the server (Vercel handles this automatically)
module.exports = app;
