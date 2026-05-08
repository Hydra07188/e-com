// Order model helpers.
// The Order module owns checkout payload normalization so controllers stay thin
// and future Order Service APIs can reuse the same contract.
function cleanText(value) {
    return String(value || '')
        .trim()
        .replace(/[<>]/g, '');
}

function roundMoney(value) {
    return Math.round(value * 100) / 100;
}

module.exports = {
    cleanText,
    roundMoney
};
