// menu.js
exports.TERMS = `CON Kama hujawahi kununua nasi, tafadhali soma na ukubali masharti yafuatayo:
Mfumo huu utakusanya taarifa zako za simu pamoja na eneo lako kwa ujumla.
1. Nakubali
2. Sikubali`;

exports.MAIN_MENU = `CON SMART RETAIL
1. Kununua Bidhaa
2. Angalia salio la Points
3. Vuna Points
0. Toka`;

exports.CATEGORIES = `CON Makundi ya bidhaa
1. Vyakula
2. Vipodozi
3. Nguo
4. Viatu
0. Rudi nyuma`;

exports.VYAKULA_SUB = `CON Vyakula
1. Mandazi
2. Juisi
0. Rudi nyuma`;

exports.VIPODOZI_SUB = `CON Vipodozi
1. Perfume
2. Mafuta ya ngozi
0. Rudi nyuma`;

// Add more sub-menus when you expand categories (Nguo, Viatu...)

exports.QUANTITY_PROMPT = (productName) =>
    `CON Weka idadi ya ${productName} unayotaka
Kisha bonyeza # kuendelea`;

exports.ORDER_SUMMARY = (productName, qty, unitPrice, total) =>
    `CON ${qty} x ${productName} @ ${unitPrice} TZS = ${total} TZS
Gharama za jumla ni ${total} TZS

1. Lipa
2. Sitisha`;

exports.DELIVERY_LOCATION = `CON Chagua eneo la utoaji
1. Ndani ya Dar
2. Nje ya Dar
0. Rudi nyuma`;

exports.PIN_PROMPT = `CON Weka namba ya siri kulipia
`;

exports.POINTS_BALANCE = (points) =>
    `END Salio lako la point ni ${points}. 
Unaweza kuzitumia kwenye Vuna Points. Asante!`;

exports.REDEEM_SUCCESS = (productName, pointsUsed) =>
    `END Umefanikiwa kuvuna ${productName} kwa kutumia ${pointsUsed} point. 
Utapokea ujumbe mfupi. Asante!`;

exports.ORDER_CONFIRM_SMS = (productName, qty, total) =>
    `Asante kwa kununua ${qty} ${productName} kwa ${total} TZS. Malipo yamekamilika. Utapokea bidhaa hivi karibuni.`;

exports.INVALID = `END Chaguo batili. Tafadhali jaribu tena.`;