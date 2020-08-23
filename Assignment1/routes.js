const reqHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>Assignment</title></head>");
    res.write(
      "<body><h1>Hi! Welcome to my page!</h1><form action='/create-user' method='POST'><input name='username' type='text' ><button type='submit'>SUBMIT</button></form></body>"
    );
    res.write("</html>");
    return res.end();
  }
  if (url === "/users") {
    res.write("<html>");
    res.write("<head><title>Assignment</title></head>");
    res.write("<body><ul><li>Mr shitbag</li><li>Shitbag2</li></ul></body>");
    res.write("</html>");
    return res.end();
  }
  if (url === "/create-user" && method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });
    return req.on("end", () => {
      const parsedData = Buffer.concat(body).toString();
      const message = parsedData.split("=")[1];
      console.log(message);
      res.statusCode = 302;
      res.setHeader("Location", "/users");
      return res.end();
    });
  }
};
module.exports = reqHandler;
