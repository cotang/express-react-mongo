module.exports = {
  renderLayout: function () {
    return `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Sample React App</title>
      </head>
      <body>
        <div id="root"></div>
        <script src="public/bundle.js"></script>
      </body>
    </html>`
  }
};
