const handleUSSD = require("./ussdStateMachine");

async function ussdController(req, res) {
    const response = await handleUSSD(req.body);
    res.set("Content-Type", "text/plain");
    res.send(response);
}

module.exports = ussdController;
