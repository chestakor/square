const express = require('express');
const app = express();

// Enable pretty JSON formatting
app.set('json spaces', 2);

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

// Export for Vercel
module.exports = app;
