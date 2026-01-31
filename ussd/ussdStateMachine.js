const menus = require("./menu");
const sendSMS = require("../sendSMS"); // assume this exists
const {
    getSession,
    createSession,
    updateSession,
    deleteSession,
} = require("./sessionStore");

const STATES = {
    START:        "START",
    TERMS:        "TERMS",
    MAIN_MENU:    "MAIN_MENU",

    // Buy flow
    SELECT_CATEGORY:   "SELECT_CATEGORY",
    SELECT_SUB:        "SELECT_SUB",
    ENTER_QUANTITY:    "ENTER_QUANTITY",
    ORDER_SUMMARY:     "ORDER_SUMMARY",
    CHOOSE_LOCATION:   "CHOOSE_LOCATION",
    ENTER_PIN:         "ENTER_PIN",
    PAYMENT_SUCCESS:   "PAYMENT_SUCCESS",   // terminal

    // Points
    VIEW_POINTS:       "VIEW_POINTS",

    // Redeem
    REDEEM_CATEGORY:   "REDEEM_CATEGORY",
    REDEEM_SUB:        "REDEEM_SUB",
    REDEEM_CONFIRM:    "REDEEM_CONFIRM",
};

const PRODUCTS = {
    "1-1": { name: "Mandazi",     price:  500, pointsPerUnit:  1 },
    "1-2": { name: "Juisi",       price: 2000, pointsPerUnit:  3 },
    "2-1": { name: "Perfume",     price:15000, pointsPerUnit: 20 },
    "2-2": { name: "Mafuta",      price: 8000, pointsPerUnit: 10 },
};

function getProduct(key) {
    return PRODUCTS[key] || null;
}

// Very simple fake points balance (later → from DB)
async function getPoints(phone) {
    // For hackathon: fake 50–500 points
    return Math.floor(Math.random() * 450) + 50;
}

async function addPoints(phone, amountTZS) {
    // Later: real DB update
    // Here: just calculate what would be added
    return Math.floor(amountTZS / 1000); // 1 point per 1,000 TZS spent
}

async function handleUSSD({ sessionId, phoneNumber, text }) {
    let session = await getSession(sessionId);

    if (!session) {
        await createSession(sessionId, phoneNumber, STATES.START, {});
        session = { state: STATES.START, data: {} };
    }

    const input = text.trim().split("*").pop(); // last input
    let response = "";
    let nextState = session.state;
    let nextData = { ...session.data };

    switch (session.state) {

        // ────────────────────────────────────────
        case STATES.START:
            response = menus.TERMS;
            nextState = STATES.TERMS;
            break;

        // ────────────────────────────────────────
        case STATES.TERMS:
            if (input === "1") {
                response = menus.MAIN_MENU;
                nextState = STATES.MAIN_MENU;
            } else {
                response = `END Umechagua kutokubali masharti. Asante.`;
                await deleteSession(sessionId);
                return response;
            }
            break;

        // ──────────────────────────────────────── MAIN MENU
        case STATES.MAIN_MENU:
            if (input === "1") {
                response = menus.CATEGORIES;
                nextState = STATES.SELECT_CATEGORY;
            } else if (input === "2") {
                const pts = await getPoints(phoneNumber);
                response = menus.POINTS_BALANCE(pts);
                await deleteSession(sessionId);
                return response;
            } else if (input === "3") {
                response = menus.CATEGORIES;
                nextState = STATES.REDEEM_CATEGORY;
            } else if (input === "0") {
                response = `END Asante kwa kutumia Smart Retail. Karibu tena!`;
                await deleteSession(sessionId);
                return response;
            } else {
                response = menus.INVALID;
                await deleteSession(sessionId);
                return response;
            }
            break;

        // ──────────────────────────────────────── BUY FLOW
        case STATES.SELECT_CATEGORY:
            if (["1","2","3","4"].includes(input)) {
                nextData.category = input;
                if (input === "1") response = menus.VYAKULA_SUB;
                else if (input === "2") response = menus.VIPODOZI_SUB;
                else response = `CON Chaguo hili bado halijaongezwa.\n0. Rudi nyuma`;
                nextState = STATES.SELECT_SUB;
            } else if (input === "0") {
                response = menus.MAIN_MENU;
                nextState = STATES.MAIN_MENU;
            } else {
                response = menus.INVALID;
                await deleteSession(sessionId);
                return response;
            }
            break;

        case STATES.SELECT_SUB:
            if (input === "0") {
                response = menus.CATEGORIES;
                nextState = STATES.SELECT_CATEGORY;
            } else {
                const key = `${nextData.category}-${input}`;
                const prod = getProduct(key);
                if (prod) {
                    nextData.productKey = key;
                    nextData.productName = prod.name;
                    response = menus.QUANTITY_PROMPT(prod.name);
                    nextState = STATES.ENTER_QUANTITY;
                } else {
                    response = `CON Bidhaa hii haipo.\n0. Rudi nyuma`;
                }
            }
            break;

        case STATES.ENTER_QUANTITY:
            const qty = parseInt(input, 10);
            if (isNaN(qty) || qty < 1) {
                response = `CON Idadi si sahihi. Jaribu tena.\n${menus.QUANTITY_PROMPT(session.data.productName)}`;
            } else {
                const prod = getProduct(session.data.productKey);
                const total = qty * prod.price;
                nextData.quantity = qty;
                nextData.total = total;
                response = menus.ORDER_SUMMARY(prod.name, qty, prod.price, total);
                nextState = STATES.ORDER_SUMMARY;
            }
            break;

        case STATES.ORDER_SUMMARY:
            if (input === "1") {
                response = menus.PIN_PROMPT;
                nextState = STATES.ENTER_PIN;
            } else if (input === "2") {
                response = `END Manunuzi yamesitishwa. Karibu tena!`;
                await deleteSession(sessionId);
                return response;
            } else {
                response = menus.INVALID;
                await deleteSession(sessionId);
                return response;
            }
            break;

        case STATES.ENTER_PIN:
            // For hackathon — fake PIN check
            if (input.length >= 4) {   // pretend success
                const ptsEarned = await addPoints(phoneNumber, session.data.total);
                // Later: real payment + real points update

                const locPrompt = menus.DELIVERY_LOCATION;
                response = locPrompt;
                nextState = STATES.CHOOSE_LOCATION;
            } else {
                response = `CON PIN si sahihi. Jaribu tena.\n${menus.PIN_PROMPT}`;
            }
            break;

        case STATES.CHOOSE_LOCATION:
            if (["1","2"].includes(input)) {
                nextData.location = input === "1" ? "Ndani ya Dar" : "Nje ya Dar";

                // In real system → call payment API here

                const prod = getProduct(session.data.productKey);
                await sendSMS(
                    phoneNumber,
                    menus.ORDER_CONFIRM_SMS(prod.name, session.data.quantity, session.data.total)
                );

                response = `END Utapokea ujumbe mfupi wa manunuzi yako. Asante kutumia huduma zetu!`;
                await deleteSession(sessionId);
                return response;
            } else if (input === "0") {
                response = menus.ORDER_SUMMARY(session.data.productName, session.data.quantity, getProduct(session.data.productKey).price, session.data.total);
                nextState = STATES.ORDER_SUMMARY;
            } else {
                response = menus.INVALID;
                await deleteSession(sessionId);
                return response;
            }
            break;

        // ──────────────────────────────────────── REDEEM FLOW (simplified — no payment)
        case STATES.REDEEM_CATEGORY:
            // same as buy → but later different logic
            if (["1","2","3","4"].includes(input)) {
                nextData.category = input;
                if (input === "1") response = menus.VYAKULA_SUB;
                else if (input === "2") response = menus.VIPODOZI_SUB;
                else response = `CON Chaguo bado halijaongezwa.\n0. Rudi`;
                nextState = STATES.REDEEM_SUB;
            } else if (input === "0") {
                response = menus.MAIN_MENU;
                nextState = STATES.MAIN_MENU;
            } else {
                response = menus.INVALID;
                await deleteSession(sessionId);
                return response;
            }
            break;

        case STATES.REDEEM_SUB:
            if (input === "0") {
                response = menus.CATEGORIES;
                nextState = STATES.REDEEM_CATEGORY;
            } else {
                const key = `${session.data.category}-${input}`;
                const prod = getProduct(key);
                if (prod) {
                    nextData.productKey = key;
                    nextData.productName = prod.name;
                    // For simplicity — assume enough points
                    const pointsNeeded = Math.ceil(prod.price / 100); // example rate
                    response = `CON Unataka kuvuna ${prod.name} kwa point ${pointsNeeded}?\n1. Ndiyo\n2. Hapana`;
                    nextState = STATES.REDEEM_CONFIRM;
                } else {
                    response = `CON Bidhaa haipo.\n0. Rudi nyuma`;
                }
            }
            break;

        case STATES.REDEEM_CONFIRM:
            if (input === "1") {
                // Later: check real points & deduct
                response = menus.REDEEM_SUCCESS(session.data.productName, 120); // fake
                await deleteSession(sessionId);
                return response;
            } else {
                response = `END Umesitisha uvunaji wa point. Asante!`;
                await deleteSession(sessionId);
                return response;
            }

        default:
            response = `END Session imeisha. Jaribu tena *234*65364#`;
            await deleteSession(sessionId);
    }

    await updateSession(sessionId, nextState, nextData);
    return response;
}

module.exports = handleUSSD;